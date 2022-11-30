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

//TODO
const exhibitCards = (exhibitList) => {

}

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
        console.log(exhibitList); // 지워야 함
      });
  });
};
