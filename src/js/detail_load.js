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
