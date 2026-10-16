// 화면 표현용 코드. 네트워크/API/계정/실제 기록/영구 저장에 접근하지 않는다.
const $ = (selector) => document.querySelector(selector);

function el(tag, parent, { cls, text, attrs } = {}) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text != null) node.textContent = text;
  if (attrs) for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (parent) parent.append(node);
  return node;
}

const ICON_EXTERNAL = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>';
const ICON_CHEVRON = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg>';

let toastTimer;
function message(text) {
  const box = $('#feedback');
  box.textContent = text;
  box.classList.toggle('is-visible', Boolean(text));
  clearTimeout(toastTimer);
  if (text) toastTimer = setTimeout(() => box.classList.remove('is-visible'), 3200);
}

const state = {
  eventTab: '',
  eventType: '전체',
  npayTab: 'available',
  // 실제 앱은 선택한 정렬을 브라우저(localStorage)에 유지한다. 사본은 메모리만 사용.
  npaySort: 'points',
  period: 'month',
};
const drafts = new Map();

/* ---------- 공통 ---------- */
const SCREENS = ['today', 'npay', 'stats'];
function show(screen) {
  if (!SCREENS.includes(screen)) screen = 'today';
  for (const s of SCREENS) $('#page-' + s).hidden = s !== screen;
  document.body.dataset.page = screen;
  document.querySelectorAll('[data-screen]').forEach((b) => {
    const active = b.dataset.screen === screen;
    b.classList.toggle('is-active', active);
    if (active) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });
  if (location.hash.slice(1) !== screen) history.replaceState(null, '', '#' + screen);
  message('');
  window.scrollTo(0, 0);
}

function renderTabs(root, items, current, onSelect) {
  root.replaceChildren();
  for (const { value, label, count } of items) {
    const selected = value === current;
    const tab = el('button', root, {
      cls: 'tab' + (selected ? ' is-active' : ''),
      attrs: { role: 'tab', 'aria-selected': String(selected), tabindex: selected ? '0' : '-1' },
    });
    el('span', tab, { text: label });
    el('b', tab, { cls: 'tab-count', text: String(count) });
    tab.onclick = () => onSelect(value);
  }
  root.onkeydown = (e) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    const tabs = [...root.querySelectorAll('[role="tab"]')];
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
    next.click();
    root.querySelectorAll('[role="tab"]')[tabs.indexOf(next)].focus();
  };
}

function renderSegmented(root, items, current, onSelect) {
  root.replaceChildren();
  for (const { value, label } of items) {
    const b = el('button', root, { cls: 'seg', text: label, attrs: { 'aria-pressed': String(value === current) } });
    b.onclick = () => onSelect(value);
  }
}

const dayDiff = (from, to) => Math.round((Date.parse(to + 'T00:00:00Z') - Date.parse(from + 'T00:00:00Z')) / 86400000);
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const weekday = (date) => WEEKDAYS[new Date(date + 'T00:00:00Z').getUTCDay()];

/* ---------- 오늘의 이벤트 ---------- */
const STATUS_OPTIONS = [
  ['', '선택하지 않음'],
  ['pending', '미참여·나중에 참여'],
  ['participated', '참여했음'],
  ['not-interested', '참여 의사 없음'],
];
const WARN_FLAGS = new Set(['조건 확인 필요', '자격 제한']);
const TYPE_FILTERS = [
  { value: '전체', label: '전체' },
  { value: '퀴즈', label: '퀴즈' },
  { value: '간단 입력', label: '간단 응모' },
];

function renderDeadline(parent, deadline) {
  const cell = el('div', parent, { cls: 'cell-deadline' });
  const left = dayDiff(DESIGN_MOCK.today, deadline);
  el('span', cell, { cls: 'dday' + (left <= 3 ? ' is-urgent' : ''), text: left === 0 ? 'D-DAY' : 'D-' + left });
  el('small', cell, { text: deadline.slice(5).replace('-', '.') + ' (' + weekday(deadline) + ') · 시각 미공개' });
}

function renderAnswer(parent, answer) {
  const box = el('div', parent, { cls: 'answer' });
  el('span', box, { cls: 'answer-label', text: '정답' });
  const list = el('ul', box, { cls: 'answer-list' });
  for (const a of answer) {
    const li = el('li', list);
    el('b', li, { text: a.q });
    el('span', li, { text: (a.no ? a.no + ' ' : '') + a.text });
  }
}

function renderDetails(parent, item) {
  const details = el('details', parent, { cls: 'details' });
  const summary = el('summary', details);
  summary.innerHTML = ICON_CHEVRON;
  el('span', summary, { text: '상세 조건' + (item.answer ? '·정답 근거' : '') });
  el('p', details, { cls: 'details-org', text: item.organizer + ' · 가상 회차' });
  const dl = el('dl', details, { cls: 'facts' });
  const rows = [...(item.terms || DESIGN_MOCK.defaultTerms), ['정답 근거', item.question || '정답형 문항 없음']];
  for (const [k, v] of rows) {
    const row = el('div', dl);
    el('dt', row, { text: k });
    el('dd', row, { text: v });
  }
}

function renderEvents() {
  const all = DESIGN_MOCK.events;
  renderTabs($('#event-tabs'), [
    { value: '', label: '참여가능', count: all.filter((e) => e.choice === '').length },
    { value: 'participated', label: '참여완료', count: all.filter((e) => e.choice === 'participated').length },
    { value: 'not-interested', label: '참여의사없음', count: all.filter((e) => e.choice === 'not-interested').length },
  ], state.eventTab, (v) => { state.eventTab = v; renderEvents(); });
  renderSegmented($('#event-types'), TYPE_FILTERS, state.eventType, (v) => { state.eventType = v; renderEvents(); });
  $('#nav-count-today').textContent = all.filter((e) => e.choice === '').length;

  const term = $('#event-search').value.trim();
  const rows = all.filter((e) =>
    e.choice === state.eventTab &&
    (state.eventType === '전체' || e.type === state.eventType) &&
    (e.title + e.organizer).includes(term));

  const root = $('#events');
  root.replaceChildren();
  for (const item of rows) {
    const changed = drafts.has(item.id) && drafts.get(item.id) !== item.choice;
    const card = el('article', root, { cls: 'event' + (changed ? ' is-changed' : ''), attrs: { 'aria-labelledby': 't-' + item.id } });

    const main = el('div', card, { cls: 'event-row' });
    const title = el('div', main, { cls: 'cell-title' });
    el('h2', title, { text: item.title, attrs: { id: 't-' + item.id } });
    const meta = el('div', title, { cls: 'title-meta' });
    el('span', meta, { cls: 'org', text: item.organizer });
    for (const f of item.flags) el('span', meta, { cls: 'flag' + (WARN_FLAGS.has(f) ? ' flag-warn' : ''), text: f });

    const prize = el('div', main, { cls: 'cell-prize' });
    el('strong', prize, { text: item.prize });
    el('small', prize, { text: item.method });

    renderDeadline(main, item.deadline);
    el('span', main, { cls: 'cell-type', text: item.type });

    const go = el('button', main, { cls: 'btn btn-primary btn-sm cell-go', attrs: { 'aria-label': item.title + ' 참여 링크 (가상)' } });
    go.innerHTML = '참여하기' + ICON_EXTERNAL;
    go.onclick = () => message('가상 참여 링크입니다. 외부 페이지를 열지 않으며 참여완료로 처리하지 않습니다.');

    if (item.answer) renderAnswer(card, item.answer);

    const foot = el('div', card, { cls: 'event-foot' });
    renderDetails(foot, item);
    const label = el('label', foot, { cls: 'status-field' });
    el('span', label, { text: '참여 상태' });
    const select = el('select', label, { attrs: { 'aria-label': item.title + ' 참여 상태' } });
    for (const [value, name] of STATUS_OPTIONS) el('option', select, { text: name, attrs: { value } });
    select.value = drafts.get(item.id) ?? item.choice;
    select.onchange = () => {
      if (select.value === item.choice) drafts.delete(item.id);
      else drafts.set(item.id, select.value);
      card.classList.toggle('is-changed', drafts.has(item.id));
      updateSaveBar();
    };
  }
  if (!rows.length) el('p', root, { cls: 'empty', text: '해당하는 가상 이벤트가 없습니다.' });
  updateSaveBar();
}

function updateSaveBar() {
  const n = drafts.size;
  $('#save-status').innerHTML = n ? '<strong>' + n + '건</strong> 변경됨 · 저장해야 반영됩니다.' : '변경한 참여 상태가 없습니다.';
  $('#save-demo').disabled = n === 0;
  $('#save-bar').classList.toggle('has-changes', n > 0);
}

/* ---------- Npay ---------- */
function renderNpay() {
  renderTabs($('#npay-tabs'), [
    { value: 'available', label: '참여가능', count: DESIGN_MOCK.npay.length },
    { value: 'completed', label: '참여완료', count: DESIGN_MOCK.completed.length },
  ], state.npayTab, (v) => { state.npayTab = v; renderNpay(); });
  $('#nav-count-npay').textContent = DESIGN_MOCK.npay.length;

  const available = state.npayTab === 'available';
  const term = $('#npay-search').value.trim().toLowerCase();
  const rows = (available ? DESIGN_MOCK.npay : DESIGN_MOCK.completed).filter((i) => i.title.toLowerCase().includes(term));
  if (state.npaySort === 'points') rows.sort((a, b) => b.points - a.points);

  const total = rows.reduce((s, i) => s + i.points, 0);
  $('#npay-summary').innerHTML = rows.length + '건 · ' + (available ? '적립 가능' : '완료') + ' 합계 <strong>' + total.toLocaleString('ko-KR') + 'P</strong>';

  const root = $('#npay-rows');
  root.replaceChildren();
  for (const item of rows) {
    const li = el('li', root, { cls: 'npay-row' + (available ? '' : ' is-done') });
    el('span', li, { cls: 'npay-title', text: item.title });
    el('strong', li, { cls: 'npay-points', text: item.points + 'P' });
    if (available) {
      const b = el('button', li, { cls: 'btn btn-outline btn-sm', attrs: { 'aria-label': item.title + ' 적립 링크 (가상)' } });
      b.innerHTML = '적립 링크' + ICON_EXTERNAL;
      b.onclick = () => message('가상 적립 링크입니다. 실제 포인트·새 탭·완료 저장에 연결하지 않습니다.');
    } else {
      const done = el('span', li, { cls: 'npay-done' });
      el('span', done, { cls: 'badge badge-done', text: '완료' });
      el('time', done, { text: item.date.slice(5).replace('-', '.'), attrs: { datetime: item.date } });
    }
  }
  if (!rows.length) el('li', root, { cls: 'empty', text: '검색 결과가 없습니다.' });
}

/* ---------- 통계 ---------- */
const PERIOD_NAMES = { day: '일간', week: '주간', month: '월간', year: '연간' };

function periodKey(date, p) {
  if (p === 'year') return date.slice(0, 4);
  if (p === 'month') return date.slice(0, 7);
  if (p === 'day') return date;
  const d = new Date(date + 'T00:00:00Z');
  return new Date(d.getTime() - ((d.getUTCDay() + 6) % 7) * 86400000).toISOString().slice(0, 10);
}

function periodLabel(k, p) {
  if (p === 'year') return k + '년';
  if (p === 'month') return k.slice(0, 4) + '년 ' + Number(k.slice(5)) + '월';
  if (p === 'day') return k + ' (' + weekday(k) + ')';
  const end = new Date(Date.parse(k + 'T00:00:00Z') + 6 * 86400000).toISOString().slice(0, 10);
  return k + ' ~ ' + end.slice(5);
}

function groups(p) {
  const map = new Map();
  const items = [
    ...DESIGN_MOCK.completed.map((i) => ({ ...i, kind: 'Npay' })),
    ...DESIGN_MOCK.eventHistory.map((i) => ({ ...i, kind: '이벤트', points: 0 })),
  ];
  for (const item of items) {
    const k = periodKey(item.date, p);
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(item);
  }
  return [...map]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, list]) => ({
      key,
      items: list.sort((a, b) => b.date.localeCompare(a.date)),
      total: list.reduce((s, i) => s + i.points, 0),
      npay: list.filter((i) => i.kind === 'Npay').length,
      events: list.filter((i) => i.kind === '이벤트').length,
    }));
}

function renderStats() {
  const cards = $('#stats-cards');
  cards.replaceChildren();
  for (const [p, label] of [['day', '오늘'], ['week', '이번 주'], ['month', '이번 달'], ['year', '올해']]) {
    const k = periodKey(DESIGN_MOCK.today, p);
    const g = groups(p).find((x) => x.key === k) || { total: 0, npay: 0, events: 0 };
    const card = el('article', cards, { cls: 'kpi' });
    const head = el('div', card, { cls: 'kpi-head' });
    el('span', head, { cls: 'kpi-label', text: label });
    el('span', head, { cls: 'kpi-range', text: periodLabel(k, p) });
    const value = el('p', card, { cls: 'kpi-value' });
    value.innerHTML = g.total.toLocaleString('ko-KR') + '<span>P</span>';
    el('p', card, { cls: 'kpi-sub', text: '이벤트 ' + g.events + '건 · Npay ' + g.npay + '건' });
  }

  renderSegmented($('#stats-tabs'),
    Object.entries(PERIOD_NAMES).map(([value, label]) => ({ value, label })),
    state.period, (v) => { state.period = v; renderStats(); });
  $('#stats-heading').textContent = PERIOD_NAMES[state.period] + ' 참여 내역 (가상)';

  const body = $('#stats-body');
  body.replaceChildren();
  groups(state.period).forEach((g, i) => {
    const row = el('tr', body, { cls: 'stats-row' });
    el('th', row, { text: periodLabel(g.key, state.period), attrs: { scope: 'row' } });
    el('td', row, { cls: 'ta-r num', text: g.events + '건' });
    el('td', row, { cls: 'ta-r num', text: g.npay + '건' });
    el('td', row, { cls: 'ta-r num strong', text: g.total.toLocaleString('ko-KR') + 'P' });
    const cell = el('td', row, { cls: 'ta-r' });
    const id = 'stats-detail-' + i;
    const toggle = el('button', cell, { cls: 'btn-link', attrs: { 'aria-expanded': 'false', 'aria-controls': id } });
    toggle.innerHTML = '<span>' + g.items.length + '건 보기</span>' + ICON_CHEVRON;

    const detail = el('tr', body, { cls: 'stats-detail', attrs: { id } });
    detail.hidden = true;
    const td = el('td', detail, { attrs: { colspan: '5' } });
    const ul = el('ul', td, { cls: 'history' });
    for (const it of g.items) {
      const li = el('li', ul);
      el('time', li, { cls: 'num', text: it.date.slice(5).replace('-', '.'), attrs: { datetime: it.date } });
      el('span', li, { cls: 'kind kind-' + (it.kind === 'Npay' ? 'npay' : 'event'), text: it.kind });
      el('span', li, { cls: 'history-title', text: it.title });
      el('span', li, { cls: 'num ta-r', text: it.kind === 'Npay' ? it.points + 'P' : '—' });
    }
    toggle.onclick = () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.firstChild.textContent = open ? g.items.length + '건 보기' : '접기';
      detail.hidden = open;
    };
  });
}

/* ---------- 이벤트 연결 ---------- */
document.querySelectorAll('[data-screen]').forEach((b) => { b.onclick = () => show(b.dataset.screen); });
document.querySelectorAll('[data-reset]').forEach((b) => { b.onclick = () => location.reload(); });
window.addEventListener('hashchange', () => show(location.hash.slice(1)));
$('#event-search').oninput = renderEvents;
$('#npay-search').oninput = renderNpay;
$('#npay-sort').value = state.npaySort;
$('#npay-sort').onchange = (e) => { state.npaySort = e.target.value; renderNpay(); };
$('#npay-updated').textContent = DESIGN_MOCK.npayUpdatedAt;

$('#save-demo').onclick = () => {
  for (const item of DESIGN_MOCK.events) {
    if (!drafts.has(item.id)) continue;
    const v = drafts.get(item.id);
    item.choice = v === 'pending' ? '' : v;
  }
  const n = drafts.size;
  drafts.clear();
  renderEvents();
  message(n + '건의 가상 상태를 메모리에 저장했습니다. 새로고침하면 초기화됩니다.');
};

$('#csv').onclick = () => {
  const lines = [
    ['기간', '이벤트(건)', 'Npay 완료(건)', '완료 기준 적립액(P)', '구분'],
    ...groups(state.period).map((g) => [periodLabel(g.key, state.period), g.events, g.npay, g.total, '모두 가상 데이터']),
  ];
  const csv = '\uFEFF' + lines.map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'DEMO-statistics-' + state.period + '.csv';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  message(PERIOD_NAMES[state.period] + ' 가상 통계 CSV를 만들었습니다.');
};

renderEvents();
renderNpay();
renderStats();
show(location.hash.slice(1) || 'today');
