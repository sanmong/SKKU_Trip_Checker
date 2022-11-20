const API_KEY = config.apikey;
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

const getLocations = () =>{
    const options = {
        method: 'GET',
        headers: {accept: 'application/json', appkey: API_KEY}
      };

    fetch('https://apis.openapi.sk.com/puzzle/pois', options)
        .then(response => response.json())
        .then(response => {return response})
        .catch(err => console.error(err));
}

const getCongestion = (poi_Id) =>{
    const options = {
        method: 'GET',
        headers: {accept: 'application/json', appkey: API_KEY}
    };

    fetch(`https://apis.openapi.sk.com/puzzle/congestion/rltm/pois/${poi_Id}`, options)
        .then(response => response.json())
        .then(response => {return response})
        .catch(err => console.error(err));
}

const getCongestions = (place_list) =>{
    const options = {
        method: 'GET',
        headers: {accept: 'application/json', appkey: API_KEY}
    };

    result_list = []

    place_list.forEach(place => {
      poi_Id = place.poiId
      fetch(`https://apis.openapi.sk.com/puzzle/congestion/rltm/pois/${poi_Id}`, options)
        .then(response => response.json())
        .then(response => result_list.push(response))
        .catch(err => console.error(err));
    });

    return result_list
}

//사용자가 조회한 장소의 시간대별 혼잡도를 제공합니다.
//target_date는 30일 이내 만 가능
const getTimelyCongestion = (poi_Id, target_date) =>{
  const options = {
    method: 'GET',
    headers: {accept: 'application/json', appkey: API_KEY}
  };

  fetch(`https://apis.openapi.sk.com/puzzle/congestion/raw/hourly/pois/${poi_Id}?date=${target_date}`, options)
    .then(response => response.json())
    .then(response => {return response})
    .catch(err => console.error(err));
}

//공휴일과 휴무일을 제외한 최근 30일 해당 장소의 평균 혼잡도입니다.
const getCongestionStat = (poi_Id) =>{
  const options = {
    method: 'GET',
    headers: {accept: 'application/json', appkey: API_KEY}
  };

  fetch(`https://apis.openapi.sk.com/puzzle/congestion/stat/hourly/pois/${poi_Id}`, options)
    .then(response => response.json())
    .then(response => {return response})
    .catch(err => console.error(err));
}
