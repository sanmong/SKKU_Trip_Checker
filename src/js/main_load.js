//Popular place에 대한 혼잡도 업데이트가 1시간 이상 경과되었는지 확인합니다.
const checkOutOfDate = (lastUpdated) => {
  let currentTime = new Date().getTime();
  let lastUpdatedTime = new Date(lastUpdated).getTime();

  const intervalHour = Math.floor((currentTime - lastUpdatedTime) / 1000 / 60 / 60);
  return (intervalHour >= 2);
}

//placeList의 혼잡도를 제공합니다.
const getCongestions = async (targetPlaceList) => {
  const options = {
      method: 'GET',
      headers: {accept: 'application/json', appkey: API_KEY}
  };

  let congestionList = [];
  for (const place of targetPlaceList) {
    let poi_Id = place.poiId;
    const response = await fetch(`${PROXY_URL}https://apis.openapi.sk.com/puzzle/congestion/rltm/pois/${poi_Id}`, options);
    if(response.status === 200) {
      let data = await response.json();
      data = {
        poiId: poi_Id,
        poiName: data.contents.poiName,
        congestion: data.contents.rltm.congestion,
        address: placeList.filter(x => x.poiId === poi_Id)[0].address
      };
      congestionList.push(data)
    } else {
      throw new Error("Failed to fetch at `getCongestions`");
    }
  }
  return congestionList;
}

//PlaceList의 targetDate 시점 예상 혼잡도를 제공합니다.
const getDateCongestions = async (targetPlaceList, targetDate) => {
  const num2day = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const options = {
      method: 'GET',
      headers: {accept: 'application/json', appkey: API_KEY}
  };

  let congestionList = [];
  for (const place of targetPlaceList) {
    let poi_Id = place.poiId;
    const response = await fetch(`${PROXY_URL}https://apis.openapi.sk.com/puzzle/congestion/stat/hourly/pois/${poi_Id}`, options);
    if(response.status == 200) {
      let data = await response.json();
      let stat = data.contents.stat.filter(x => x.dow === num2day[targetDate.getDay()])
                                    .filter(x => ((parseInt(x.hh) >= 10) && (parseInt(x.hh) <= 20)))
                                    .reduce((sum, x) => sum + x.congestion, 0.0) / 11;
      data = {
        poiId: poi_Id,
        poiName: data.contents.poiName,
        congestion: stat,
        address: placeList.filter(x => x.poiId === poi_Id)[0].address
      };
      congestionList.push(data);
    } else {
      throw new Error("Failed to fetch at `getDateCongestions`");
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
  }

  const congestions = JSON.parse(localStorage.getItem("congestionPopular"));
  return await congestions;
}

//카드 하나를 생성합니다.
const renderSingleCard = (cardInfo, targetDate, isPresent) => {
  const detailUrl = `html/detail.html?poiId=${cardInfo.poiId}`
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1;
  const day = targetDate.getDate();
  const dateIndicator = `${year}년 ${month}월 ${day}일 ` + (isPresent ? "현재 혼잡도" : "예상 혼잡도");
  let congestionPercent = Math.round(cardInfo.congestion * 10000) / 100;
  let congestionLevel = Math.ceil(congestionPercent / 10);
  if(!congestionPercent) {
    congestionPercent = 0.0;
    congestionLevel = 1;
  }

  return `
  <div class="card">
    <div class="place-item">
      <div class="place-img">
        <a href="${detailUrl}">
          <img class="place-image" src="assets/places/${cardInfo.poiId}.jpg">
        </a>
      </div>
      <div class="info">
        <div class="title">
          <a href="${detailUrl}">
            <strong>${cardInfo.poiName}</strong>
          </a>
        </div>
        <div class="progress">
          <div class="progress-bar"
              role="progressbar"
              style="width: ${congestionLevel * 10}%; background-color: ${progressLevelColor[congestionLevel]}"
              aria-valuenow="${congestionLevel}"
              aria-valuemin="0"
              aria-valuemax="10"
          >${congestionLevel}</div>
        </div>
        <div class="address">
          ${cardInfo.address}
        </div>
      </div>
      <div class="date-congestion">
         ${dateIndicator}는 <strong>${congestionPercent}</strong>%입니다.
      </div>
      <div class="more-information">
        <a href="${detailUrl}">
          상세 정보 보기
        </a>
      </div>
    </div>
  </div>
  `;
}

//카드를 html에 렌더링합니다.
const exhibitCards = (exhibitList, targetDate, isPresent) => {
  let cardDiv = document.querySelector("#card-list");

  cardDiv.innerHTML = "";
  for(cardInfo of exhibitList)
    cardDiv.innerHTML += renderSingleCard(cardInfo, targetDate, isPresent);
}

// Main page loading
window.onload = () => {
  // 검색창 현재 날짜 설정
  let exhibitList;
  let visitDate = document.querySelector("#visit-date");
  let stateSelector = document.querySelector("#search-state");
  let countySelector = document.querySelector("#search-county");
  let placeInput = document.querySelector("#place-name");

  visitDate.value = visitDate.min = new Date().toISOString().split('T')[0];
  visitDate.max = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0];

  // 메인 페이지 Popular place에 대한 혼잡도를 local storage에 저장 및 표시 대상으로 지정
  getPopularPlaceCongestions().then(data => {
    exhibitList = data;
    exhibitCards(exhibitList, new Date(), true);
  });

  // 검색창 State 선택 시 County 업데이트
  stateSelector.addEventListener("change", () => {
    let selected = stateSelector.value;
    let countyList = stateList[selected];

    let defaultOption = new Option("::선택::", "null");
    defaultOption.hidden = true;

    document.querySelectorAll("#search-county > option").forEach(option => option.remove());
    countySelector.appendChild(defaultOption, undefined);
    countyList.forEach(county => {
      let newOption = new Option(county, county);
      countySelector.appendChild(newOption, undefined);
    });
  });

  // Search 버튼 클릭 시 event
  let searchBtn = document.querySelector("#btn-search");
  searchBtn.addEventListener("click", () => {
    const selectedDate = new Date(visitDate.value);
    let searchResults = searchPlace(
      stateSelector.value,
      countySelector.value,
      placeInput.value
    );
    if(searchResults.length !== 0) {
      if(selectedDate.getDate() === new Date().getDate()) {
        getCongestions(searchResults).then(data => {
          exhibitList = data;
          exhibitCards(exhibitList, new Date(), true);
          });
      } else {
        getDateCongestions(searchResults, selectedDate).then(data => {
          exhibitList = data
          exhibitCards(exhibitList, selectedDate, false);
        });
      }
    }
  });
};
