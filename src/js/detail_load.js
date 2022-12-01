//제공 가능한 장소 리스트를 불러옵니다.
const getLocations = async () => {
  const options = {
      method: 'GET',
      headers: {accept: 'application/json', appkey: API_KEY}
    };

  const response = await fetch(`${PROXY_URL}https://apis.openapi.sk.com/puzzle/pois`, options);
  if(response.status.code === '00') {
    const data = await response.json();
    return data;
  } else {
    throw new Error("Failed to fetch at `getLocations`");
  }
}

//특정 장소의 혼잡도를 제공합니다.
const getCongestion = async (poi_Id) => {
  const options = {
    method: 'GET',
    headers: {accept: 'application/json', appkey: API_KEY}
  };

  const response = await fetch(`${PROXY_URL}https://apis.openapi.sk.com/puzzle/congestion/rltm/pois/${poi_Id}`, options);
  if(response.status === 200) {
    const data = await response.json();
    return data;
  } else {
    throw new Error("Failed to fetch at `getCongestion`");
  }
}


//사용자가 조회한 장소의 시간대별 혼잡도를 제공합니다.
//target_date는 30일이내만 가능합니다.
const getTimelyCongestion = async (poi_Id, target_date) => {
  const options = {
    method: 'GET',
    headers: {accept: 'application/json', appkey: API_KEY}
  };

  const response = await fetch(`${PROXY_URL}https://apis.openapi.sk.com/puzzle/congestion/raw/hourly/pois/${poi_Id}?date=${target_date}`, options);
  if(response.status == 200) {
    const data = await response.json();
    return data;
  } else {
    throw new Error("Failed to fetch at `getTimelyCongestion`");
  };
}

//공휴일과 휴무일을 제외한 최근 30일 해당 장소의 평균 혼잡도입니다.
const getCongestionStat = async (poi_Id) => {
  const options = {
    method: 'GET',
    headers: {accept: 'application/json', appkey: API_KEY}
  };

  const response = await fetch(`${PROXY_URL}https://apis.openapi.sk.com/puzzle/congestion/stat/hourly/pois/${poi_Id}`, options);
  if(response.status == 200) {
    const data = await response.json();
    return data;
  } else {
    throw new Error("Failed to fetch at `getCongestionStat`");
  }
}

const setPlaceInfo = async (poiId) => {
  placeResult = placeList.filter(place => place.poiId === poiId);
  //console.log(placeResult[0].name);

  document.getElementById("place-title").innerText = placeResult[0].name;
  document.getElementById("place-addr").innerText = placeResult[0].address;
}

//실시간 혼잡도 게이지바 설정
const setRealtimeGauge = async (poiId) =>{
  const realtimeCongestion = await getCongestion(poiId);
  console.log(realtimeCongestion)

  const element = document.getElementById("realtime-gauge");
  const congestion = realtimeCongestion['contents']['rltm']['congestionLevel'];
  element.style.width = `${congestion}0%`;
  element.ariaValueNow = `${congestion}`;
  element.innerText = `${congestion}`;
}

//어제 기준 혼잡도 게이지바 설정
//API 호출 시간 기준
const setTimelyGauge = async (poiId) =>{
  const today = new Date();
  const currHour = today.getHours();//0~23

  const timelyCongestion = await getTimelyCongestion(poiId, "ystday");
  console.log(timelyCongestion)

  const element = document.getElementById("timely-gauge");
  let congestion = timelyCongestion['contents']['raw'][currHour]['congestionLevel'];
  if(!congestion){
    congestion = 0
  }
  element.style.width = `${congestion}0%`;
  element.ariaValueNow = `${congestion}`;
  element.innerText = `${congestion}`;
}

//통계성 혼잡도 게이지바 설정
//이전 한달 기준 해당 요일 해당 시간의 평균 혼잡도
const setStatGauge = async (poiId) =>{
  const today = new Date();
  const currHour = today.getHours();//0~23
  let currDay = today.getDay();   //sunday ~ saturday : 0 ~ 6
  currDay = currDay - 1 > -1 ? currDay - 1 : 6; //monday ~ sunday : 0 ~ 6
  console.log(`currHour = ${currHour} && currDay = ${currDay}`);

  const congestStat = await getCongestionStat(poiId);
  console.log(congestStat)

  const element = document.getElementById("stat-gauge");
  const congestion = congestStat['contents']['stat'][currDay*24 + currHour]['congestionLevel'];
  element.style.width = `${congestion}0%`;
  element.ariaValueNow = `${congestion}`;
  element.innerText = `${congestion}`;

}

//detail 페이지 장소 이미지 로드
const setPlaceImage = async (poiId) => {
  const imagePath = `../assets/places/${poiId}.jpg`;
  document.getElementById('place-image').src = imagePath;
}

//when detail page loaded
window.onload = () => {
  const urlParams = new URL(location.href).searchParams;
  const poiId = urlParams.get('poiId');
  console.log(poiId);

  setPlaceInfo(poiId);
  setPlaceImage(poiId);

  setRealtimeGauge(poiId);
  setTimelyGauge(poiId);
  setStatGauge(poiId);




}
