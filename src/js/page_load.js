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

const getLocations =()=>{
    const options = {
        method: 'GET',
        headers: {accept: 'application/json', appkey: API_KEY}
      };
      
    fetch('https://apis.openapi.sk.com/puzzle/pois', options)
        .then(response => response.json())
        .then(response => console.log(response.contents))
        .catch(err => console.error(err));
}

const getCongestion = () =>{
    const options = {
        method: 'GET',
        headers: {accept: 'application/json', appkey: API_KEY}
    };
    
    fetch('https://apis.openapi.sk.com/puzzle/congestion/rltm/pois/10067845', options)
        .then(response => response.json())
        .then(response => console.log(response))
        .catch(err => console.error(err));
}

const getCongestions = () =>{
    const options = {
        method: 'GET',
        headers: {accept: 'application/json', appkey: API_KEY}
    };
    
    fetch('https://apis.openapi.sk.com/puzzle/congestion/rltm/pois/10067845', options)
        .then(response => response.json())
        .then(response => console.log(response))
        .catch(err => console.error(err));
}

