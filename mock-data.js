// 독립 작성한 가상 데이터. 실제 앱의 state/data 파일을 읽거나 복사하지 않는다.
const DESIGN_MOCK={
 events:[
 {id:'DEMO-E01',title:'가상시민연구소 생활경제 OX 퀴즈',organizer:'가상시민연구소',prize:'커피 교환권',method:'추첨 · 50명',deadline:'2026-10-23',type:'퀴즈',answer:'Q1: X · Q2: O',question:'가상의 경제 상식 OX 문항입니다.',flags:[],choice:''},
 {id:'DEMO-E02',title:'가상환경재단 우리 동네 이름 찾기',organizer:'가상환경재단',prize:'모바일 상품권 5,000원',method:'추첨 · 100명',deadline:'2026-10-28',type:'퀴즈',answer:'Q1: ② 초록길',question:'가상 지도에서 공원의 이름을 고르는 예시입니다.',flags:['로그인 필요','조건 확인 필요'],choice:''},
 {id:'DEMO-E03',title:'가상문화센터 가을 소식 응모',organizer:'가상문화센터',prize:'간식 교환권',method:'추첨 · 30명',deadline:'2026-11-02',type:'간단 입력',answer:null,flags:['자격 제한'],choice:''},
 {id:'DEMO-E04',title:'가상도서관 독서 퀴즈',organizer:'가상도서관',prize:'커피 교환권',method:'추첨 · 20명',deadline:'2026-10-20',type:'퀴즈',answer:'Q1: ③ 책갈피',choice:'participated',flags:[]}
 ],
 npay:[['가상 북스토어 신간 구경하기',50],['가상 마켓 가을 기획전',30],['가상 여행상점 주말 여행',25],['가상 리빙샵 공간 아이디어',20],['가상 디지털관 신제품 소식',15],['가상 문구상점 새 노트 만나기',15],['가상 취미공방 만들기 이야기',10],['가상 반려생활 산책 소품',5]].map(([title,points],i)=>({id:'DEMO-N'+i,title,points})),
 completed:[
 {id:'DEMO-C01',title:'가상 포인트 예시 A',points:30,date:'2026-10-16'},
 {id:'DEMO-C02',title:'가상 포인트 예시 B',points:50,date:'2026-10-16'},
 {id:'DEMO-C03',title:'가상 포인트 예시 C',points:20,date:'2026-10-14'},
 {id:'DEMO-C04',title:'가상 포인트 예시 D',points:15,date:'2026-10-09'},
 {id:'DEMO-C05',title:'가상 포인트 예시 E',points:30,date:'2026-09-21'},
 {id:'DEMO-C06',title:'가상 포인트 예시 F',points:25,date:'2026-08-03'}
 ],
 eventHistory:[{title:'가상도서관 독서 퀴즈',date:'2026-10-16'},{title:'가상과학관 상식 퀴즈',date:'2026-10-13'},{title:'가상음악관 가을 응모',date:'2026-09-18'}]
};
