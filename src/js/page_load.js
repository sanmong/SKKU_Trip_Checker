const API_KEY = config.apikey;
const PROXY_URL = config.proxy;

const popularPlaces = [
    {
        "poiId": "5799875",
        "poiName": "롯데월드몰"
    },
    {
        "poiId": "11614",
        "poiName": "김포국제공항국내선"
    },
    {
        "poiId": "497342",
        "poiName": "인천국제공항제1여객터미널"
    },
    {
        "poiId": "10067845",
        "poiName": "더현대서울"
    },
    {
        "poiId": "187961",
        "poiName": "롯데월드잠실점"
    },
    {
        "poiId": "387701",
        "poiName": "에버랜드"
    },
    {
        "poiId": "318195",
        "poiName": "경주월드"
    },
]

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
      console.log(response.status);
      throw new Error("Failed to fetch at `getCongestions`");
    }
  }

  return congestionList;
}

//사용자가 조회한 장소의 시간대별 혼잡도를 제공합니다.
//target_date는 30일이내만 가능합니다.
const getTimelyCongestion = async (poi_Id, target_date) =>{
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
const getCongestionStat = async (poi_Id) =>{
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

//Popular place에 대한 혼잡도 업데이트가 1시간 이상 경과되었는지 확인합니다.
const checkOutOfDate = (lastUpdated) => {
  let currentTime = new Date().getTime();
  let lastUpdatedTime = new Date(lastUpdated).getTime();

  const intervalHour = Math.floor((currentTime - lastUpdatedTime) / 1000 / 60 / 60);
  return (intervalHour >= 2);
}

//메인 페이지에 표시되는 장소들의 실시간 혼잡도를 불러와 로컬 스토리지에 저장합니다.
const getPopularPlaceCongestions = async () =>{
  // 이미 불러온 것이 있는지 확인
  const lastUpdated = localStorage.getItem("lastUpdatedAt");
  if (!lastUpdated || checkOutOfDate(lastUpdated)) {
    let congestions = await getCongestions(popularPlaces);
    localStorage.setItem("congestionPopular", JSON.stringify(congestions));
    localStorage.setItem("lastUpdatedAt", new Date());
    console.log("Newly updated!")
  }

  const congestions = JSON.parse(localStorage.getItem("congestionPopular"));
  return await congestions;
}

getPopularPlaceCongestions().then(console.log);
