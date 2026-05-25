시간표 교체 검색기 - 모듈화 버전

실행 방법
1. 압축을 풉니다.
2. index.html 파일을 크롬 또는 엣지 브라우저로 엽니다.
3. 메인 화면의 드래그 앤 드롭 영역에 시간표 엑셀 파일을 끌어다 놓거나, 기존과 동일하게 [파일 열기] 버튼으로 파일을 불러옵니다.

파일 구조
- index.html: 화면 구조와 외부 라이브러리 연결
- css/styles.css: 화면 디자인, 표, 셀 강조, 화살표 애니메이션 스타일
- js/tailwind-config.js: Tailwind 색상/폰트 설정
- js/state.js: 전체 상태값 관리
- js/dom.js: DOM 요소 연결
- js/utils.js: 반 번호 추출, 빈 셀 판단 등 공통 함수
- js/messages.js: 상단 안내 문구와 교체 결과 패널 표시
- js/arrows.js: 교체 이동 화살표 표시
- js/table.js: 시간표 표 렌더링, 행 순서 복구, 교체 가능 행 끌어오기
- js/excel.js: 엑셀 불러오기, 드래그 앤 드롭 파일 처리, 데이터 처리, 내보내기, 양식 다운로드
- js/swap.js: 직접 교체 및 다중 교체 탐색 로직
- js/main.js: 이벤트 연결 및 앱 시작

안내
- ES Module 방식이 아니라 일반 script 방식으로 분리했습니다.
- 그래서 별도 서버 설치 없이 index.html을 직접 열어도 실행됩니다.
