// 특정 장소의 주소 반환
const getPlaceAddress = async (poi_Id) => {
  const options = {
    method: 'GET',
    headers: {accept: 'application/json', appkey: API_KEY}
  };

  const response = await fetch(`${PROXY_URL}https://apis.openapi.sk.com/tmap/pois/${poi_Id}?version=1&findOption=id&resCoordType=WGS84GEO`, options);
  if(response.status == 200) {
    let data = await response.json()
    data = {
      poiId: data.poiDetailInfo.id,
      name: data.poiDetailInfo.name,
      address: data.poiDetailInfo.address,
      lcdName: data.poiDetailInfo.lcdName,
      mcdName: data.poiDetailInfo.mcdName
    };
    return data;
  } else {
    throw new Error("Failed to fetch at `getPlaceAddress`");
  };
}

// 시/도 와 구/군 정보, 장소 이름 정보를 통해 장소 반환
const searchPlace = (state, county, name) => {
  /* Reference:
    입력값 내 공백 제거: https://stackoverflow.com/questions/5963182/how-to-remove-spaces-from-a-string-using-javascript

    6 Cases
    state | x | o | o | o | o | x
    county| x | x | x | o | o | x
    place | x | x | o | x | o | o
  */

  // Invalid
  if(state === 'null' && county === 'null' && name === "") { alert("검색할 장소 정보를 입력해주세요."); return []; }
  if(state !== 'null' && county === 'null' && name === "") { alert("구/군 정보를 선택해주세요."); return []; }

  // Valid
  let searchResults;
  if(state !== 'null' && county === 'null' && name !== "") { // oxo
    searchResults = placeList.filter(place => place.lcdName === state)
                              .filter(place => place.name.replace(/\s+/g, '').includes(name.replace(/\s+/g, '')));
  } else if(state !== 'null' && county !== 'null' && name === "") { // oox
    searchResults = placeList.filter(place => place.lcdName === state)
                              .filter(place => place.mcdName === county)
  } else if(state !== 'null' && county !== 'null' && name !== "") { // ooo
    searchResults = placeList.filter(place => place.lcdName === state)
                              .filter(place => place.mcdName === county)
                              .filter(place => place.name.replace(/\s+/g, '').includes(name.replace(/\s+/g, '')));
  } else if(state === 'null' && county === 'null' && name !== "") { // xxo
    searchResults = placeList.filter(place => place.name.replace(/\s+/g, '').includes(name.replace(/\s+/g, '')));
  } else {
    throw new Error("Unexpected search option.");
  }

  if(searchResults.length === 0) {
    alert("검색 결과가 존재하지 않습니다.")
  }

  return searchResults;
}
