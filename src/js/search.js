// 오늘 날짜로 검색창 자동 설정하기 위해 미리 추가합니다. 확인 후 이 주석은 삭제해주세요.
let visitDate = document.querySelector("#visit-date");
visitDate.value = new Date().toISOString().split('T')[0];