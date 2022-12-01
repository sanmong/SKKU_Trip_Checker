//Popular place에 대한 혼잡도 업데이트가 1시간 이상 경과되었는지 확인합니다.
const checkOutOfDate = (lastUpdated) => {
  let currentTime = new Date().getTime();
  let lastUpdatedTime = new Date(lastUpdated).getTime();

  const intervalHour = Math.floor((currentTime - lastUpdatedTime) / 1000 / 60 / 60);
  return (intervalHour >= 2);
}

//PlaceList의 혼잡도를 제공합니다.
const getCongestions = async (placeList) => {
  const options = {
      method: 'GET',
      headers: {accept: 'application/json', appkey: API_KEY}
  };

  let congestionList = [];
  for (const place of placeList) {
    let poi_Id = place.poiId;
    const response = await fetch(`${PROXY_URL}https://apis.openapi.sk.com/puzzle/congestion/rltm/pois/${poi_Id}`, options);
    if(response.status === 200) {
      const data = await response.json();
      congestionList.push(data)
    } else {
      throw new Error("Failed to fetch at `getCongestions`");
    }
  }
  return congestionList;
}

//메인 페이지에 표시되는 장소들의 실시간 혼잡도를 불러와 로컬 스토리지에 저장합니다.
const getPopularPlaceCongestions = async () => {
  // 이미 불러온 것이 있는지 확인
  const lastUpdated = localStorage.getItem("lastUpdatedAt");
  if (!lastUpdated || checkOutOfDate(lastUpdated)) {
    let congestions = await getCongestions(popularPlaceList);
    localStorage.setItem("congestionPopular", JSON.stringify(congestions));
    localStorage.setItem("lastUpdatedAt", new Date());
    console.log("Newly updated!")
  }

  const congestions = JSON.parse(localStorage.getItem("congestionPopular"));
  return await congestions;
}


const exhibitCards = (exhibitList) => {
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var stringDate = year + "년 " + month + "월 " + day + "일 ";//현재 날짜 및 string으로 변환

  var newDiv = document.createElement("div");
  var newA = document.createElement("a");
  var divlistCard = document.querySelector(".card-list");
  var divCard = divlistCard.querySelector(".card");
  var divPlaceItem = divCard.querySelector(".place-item");
  var divPlaceImg = divPlaceItem.querySelector(".place-img");
  var divCardInfo = divPlaceItem.querySelector(".info");
  var divCongestion = divCardItem.querySelector(".date-congestion");
  var divMoreInfo = divCardItem.querySelector(".more-infomation");
  var divTitle = divCardInfo.querySelector(".title");
  var divAddress = divCardInfo.querySelector(".address");


  divCard.remove;//기존에 있던 테이블 삭제

  for (var i = 0; i < exhibitList.length; i++) {
    let ithCard = exhibitList[i];
    cardlist.append(newDiv.className = "card");
    divCard.append(newDiv.className = "place-item");
    divPlaceItem.append(newDiv.className = "place-img", newDiv.className = "info", newDiv.className = "date-congestion", newDiv.className = "more-information");
    divPlaceInfo.append(newDiv.className = "title",newDiv.className = "address");

    divPlaceImg.innerHTML = '<img src="' + '"assets/thumb_1.jpg"' + 'style="float: left; width: 300px; height: 300px; border-radius: 10px; margin-right: 50px;"/>';

    divTitle.innerHTML = ithCard.contents.poiName.style.fontWeight = "bold";
    divAddress.innerHTML = ithCard.contents.poiId.style.fontWeight = "small";

    divCongestion.innerHTML = stringDate + "혼잡도는 " + ithCard.contnets.congestion*100 + "% 입니다."

    divMoreInfo.innerHTML = '<a href="html/detail.html?poiId=' + ithCard.contents.poiId + '">상세 정보 보기</a>';
}}
//searchBtn 에 연결하였습니다.

// Main page loading
window.onload = () => {
  // 검색창 현재 날짜 설정
  let visitDate = document.querySelector("#visit-date");
  visitDate.value = visitDate.min = new Date().toISOString().split('T')[0];

  // 메인 페이지 Popular place에 대한 혼잡도를 local storage에 저장 및 표시 대상으로 지정
  let exhibitList;
  getPopularPlaceCongestions().then(data => exhibitList = data);

  // 검색창 State 선택 시 County 업데이트
  let stateSelector = document.querySelector("#search-state");
  let countySelector = document.querySelector("#search-county");
  let placeInput = document.querySelector("#place-name");

  stateSelector.addEventListener("change", () => {
    let selected = stateSelector.value;
    let countyList = stateList[selected];

    let defaultOption = new Option("::선택::", "null");
    defaultOption.hidden = true;

    document.querySelectorAll('#search-county > option').forEach(option => option.remove());
    countySelector.appendChild(defaultOption, undefined);
    countyList.forEach(county => {
      let newOption = new Option(county, county);
      countySelector.appendChild(newOption, undefined);
    });
  });

  // Search 버튼 클릭 시 event
  let searchBtn = document.querySelector("#btn-search");
  searchBtn.addEventListener("click", () => {
    let searchResults = searchPlace(
      stateSelector.value,
      countySelector.value,
      placeInput.value
    );
    if(searchResults.length !== 0)
      getCongestions(searchResults).then(data => {
        exhibitList = data
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var stringDate = year + "년 " + month + "월 " + day + "일 ";//현재 날짜 및 string으로 변환
        var html='';
        var table = document.getElementById("card-list");
        table.remove;//기존에 있던 테이블 삭제
        console.log(exhibitList);
        for (var i = 0; i < exhibitList.length; i++)  {
          html += '<div class="card">';
          html += '<div class="place-item">';
          html +=  '<div class="place-img">'
          html +=    '<a href="html/detail.html?poiId='+ exhibitList[i].contents.poiId + '">';
          html +=      '<img class="place-image"src="assets/thumb_1.jpg"style="float: left; width: 300px; height: 300px; border-radius: 10px; margin-right: 50px;">';
          html +=    '</a>';
          html +=  '</div>';
          html +=  '<div class="info">';
          html +=    '<div class="title">';
          html +=    '<a href="html/detail.html?poiId='+ exhibitList[i].contents.poiId + '">';
          html +=        '<strong>';
          html +=        exhibitList[i].contents.poiName;
          html +=        '</strong>';
          html +=      '</a>';
          html +=    '</div>';
          html +=    '<div class="progress">'
          html +=      '<div class="progress-bar" role="progressbar" style="width: 80%;" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100">';
          html +=      '</div>';
          html +=    '</div>'
          html +=    '<div class="address">';
          html +=      '<small>';
          html +=     exhibitList[i].contents.poiId;
          html +=      '</small>';
          html +=    '</div>';
          html +=  '</div>';
          html +=  '<div class="date-congestion">';
          html +=    stringDate;
          html +=    ' 혼잡도는 ';
          html +=    exhibitList[i].contents.rltm.congestion*100;
          html +=    '%입니다.';
          html +=  '</div>';
          html +=  '<div class="more-information">';
          html +=    '<a href="html/detail.html?poiId='+ exhibitList[i].contents.poiId + '">';
          html +=    '상세 정보 보기</a>';
          html +=   '</div>';
          html +=   '</div>';
          html +=  '</div>';
        }
        divCard.innerHTML = html;//테이블에 추가
      });
  });
}
