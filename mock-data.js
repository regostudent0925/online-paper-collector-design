// 독립 작성한 가상 데이터. 실제 앱의 state/data 파일을 읽거나 복사하지 않는다.
// 화면 코드(design.js)는 이 객체만 읽는다. 실제 앱 반영 시 API 응답을 같은 형태로 맞추면 된다.
const DESIGN_MOCK = {
  today: '2026-10-16',
  npayUpdatedAt: '2026. 10. 16. 09:00',

  // answer: 정답형 문항만. no는 보기 번호(OX·주관식이면 빈 문자열), text는 답안 내용.
  // flags: 로그인·가입·앱·자격 제한·조건 확인 필요 등 짧은 핵심 표시.
  events: [
    {
      id: 'DEMO-E01', title: '가상시민연구소 생활경제 OX 퀴즈', organizer: '가상시민연구소',
      prize: '커피 교환권', method: '추첨 · 50명', deadline: '2026-10-23', type: '퀴즈',
      answer: [{ q: 'Q1', no: '', text: 'X' }, { q: 'Q2', no: '', text: 'O' }],
      question: '가상의 경제 상식 OX 문항입니다.', flags: [], choice: '',
    },
    {
      id: 'DEMO-E02', title: '가상환경재단 우리 동네 이름 찾기', organizer: '가상환경재단',
      prize: '모바일 상품권 5,000원', method: '추첨 · 100명', deadline: '2026-10-28', type: '퀴즈',
      answer: [{ q: 'Q1', no: '②', text: '초록길' }],
      question: '가상 지도에서 공원의 이름을 고르는 예시입니다.', flags: ['로그인 필요', '조건 확인 필요'], choice: '',
    },
    {
      id: 'DEMO-E05', title: '가상생활협동조합 창립 기념 가을맞이 이웃 나눔 캠페인 응원 댓글 이벤트 (긴 제목 줄바꿈 예시)', organizer: '가상생활협동조합',
      prize: '제철 과일 상자', method: '선착순 · 200명', deadline: '2026-10-18', type: '간단 입력',
      answer: null, question: '', flags: ['가입 필요', '앱 필요'], choice: '',
    },
    {
      id: 'DEMO-E06', title: '가상과학관 우주 상식 퀴즈', organizer: '가상과학관',
      prize: '관람권 2매', method: '추첨 · 40명', deadline: '2026-10-25', type: '퀴즈',
      answer: [{ q: 'Q1', no: '③', text: '목성' }, { q: 'Q2', no: '①', text: '약 8분' }, { q: 'Q3', no: '④', text: '은하수' }],
      question: '가상 과학관 안내문에 실린 우주 상식 문항입니다.', flags: [], choice: '',
    },
    {
      id: 'DEMO-E03', title: '가상문화센터 가을 소식 응모', organizer: '가상문화센터',
      prize: '간식 교환권', method: '추첨 · 30명', deadline: '2026-11-02', type: '간단 입력',
      answer: null, question: '', flags: ['자격 제한'], choice: '',
    },
    {
      id: 'DEMO-E04', title: '가상도서관 독서 퀴즈', organizer: '가상도서관',
      prize: '커피 교환권', method: '추첨 · 20명', deadline: '2026-10-20', type: '퀴즈',
      answer: [{ q: 'Q1', no: '③', text: '책갈피' }],
      question: '가상 도서관 소식지의 독서 상식 문항입니다.', flags: [], choice: 'participated',
    },
  ],

  // 상세 펼치기 공통 항목(가상). 행사별로 다르면 event.terms로 덮어쓴다.
  defaultTerms: [
    ['요구 정보', '이름·연락처를 요구하는 화면의 디자인 예시. 실제 입력란 없음'],
    ['수집 목적', '가상 경품 안내'],
    ['보유 기간', '가상: 행사 종료 후 30일'],
    ['필수 동의', '가상: 마케팅 필수 동의 없음'],
    ['자격 제한', '가상 예시 · 실제 행사 조건 아님'],
    ['중복 참여', '가상: 회차당 1회'],
  ],

  npay: [
    ['가상 북스토어 신간 구경하기', 50], ['가상 마켓 가을 기획전', 30], ['가상 여행상점 주말 여행', 25],
    ['가상 리빙샵 공간 아이디어', 20], ['가상 디지털관 신제품 소식', 15], ['가상 문구상점 새 노트 만나기', 15],
    ['가상 취미공방 만들기 이야기', 10], ['가상 반려생활 산책 소품', 5],
  ].map(([title, points], i) => ({ id: 'DEMO-N' + i, title, points })),

  completed: [
    { id: 'DEMO-C01', title: '가상 포인트 예시 A', points: 30, date: '2026-10-16' },
    { id: 'DEMO-C02', title: '가상 포인트 예시 B', points: 50, date: '2026-10-16' },
    { id: 'DEMO-C03', title: '가상 포인트 예시 C', points: 20, date: '2026-10-14' },
    { id: 'DEMO-C04', title: '가상 포인트 예시 D', points: 15, date: '2026-10-09' },
    { id: 'DEMO-C05', title: '가상 포인트 예시 E', points: 30, date: '2026-09-21' },
    { id: 'DEMO-C06', title: '가상 포인트 예시 F', points: 25, date: '2026-08-03' },
  ],

  eventHistory: [
    { title: '가상도서관 독서 퀴즈', date: '2026-10-16' },
    { title: '가상과학관 상식 퀴즈', date: '2026-10-13' },
    { title: '가상음악관 가을 응모', date: '2026-09-18' },
  ],
};
