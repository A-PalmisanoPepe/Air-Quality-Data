// You can find:
// ANIMATION at row 15
// RELOAD PAGE at row 66
// FUNCTIONS TO SHOW DATA at row 74
// GEOLOCATOR at row 149
// SEARCH BY KEYWORD at row 211
// LIST CREATION AND MANAGEMENT at row 310
// MAP at row 417

import "../css/style.css";
import "../css/style-responsive.css";

let APIkey = process.env.SECRET_KEY;

// ANIMATION 

const aqi = document.querySelector('#aqi');
const flowerCard = document.querySelector('#flower-card');
const flowers = document.querySelectorAll('.flower');
const flipCardInner = document.querySelector('.flip-card-inner');

function flipCardOn() {
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
    });
    setTimeout(() => flipCardInner.classList.add('flip-card-inner-active'), 3000);
    flowerCard.classList.add('flower-active');
}

function flipCardOff() {
    flipCardInner.classList.remove('flip-card-inner-active');
    flowersReset();
}

function changeBGColor(elements, color) {
    for (let element of elements) {
        element.style.backgroundColor = color;
    }
}

function pollutionAlert() {
    if (+aqi.textContent < 51) {
        changeBGColor(flowers, 'rgb(115, 233, 207)');
    } else if (+aqi.textContent >= 51 && +aqi.textContent < 100) {
        changeBGColor(flowers, 'palegoldenrod');
    } else if (+aqi.textContent >= 101 && +aqi.textContent < 150) {
        changeBGColor(flowers, 'peru');
    } else if (+aqi.textContent >= 151 && +aqi.textContent < 200) {
        changeBGColor(flowers, 'rgb(175, 56, 56)');
    } else if (+aqi.textContent >= 201 && +aqi.textContent < 300) {
        changeBGColor(flowers, 'indigo');
    } else if (+aqi.textContent >= 301) {
        changeBGColor(flowers, 'rgb(85, 0, 0)');
    } else {
        changeBGColor(flowers, 'lavender');
    }
}

function flowersReset() {
    changeBGColor(flowers, 'lavender');
    flowerCard.classList.remove('flower-active');
}

// RELOAD PAGE

const logo = document.querySelector('.logo');

logo.onclick = function () {
    location.reload();
}

// FUNCTIONS TO SHOW DATA

let latitude = 0;
let longitude = 0;
let mapZoom = 1;
const theads = document.querySelectorAll('.thead');
const data = document.querySelectorAll('.data');
const aqiTitle = document.querySelector('#aqi-title');

function timeDataManager(relevation) {
    let options = { year: 'numeric', month: 'long', day: 'numeric' };
    data[2].innerHTML = 'Last survey took place on ' + relevation.toLocaleDateString('en-US', options) + '<br>at ' + relevation.toLocaleTimeString('en-US') + '.';
}

function dataManager(json) {
    data[1].textContent = json.data.city.name;
    let lastRelevation = new Date(json.data.time.s);
    timeDataManager(lastRelevation);
    data[3].textContent = json.data.aqi;
    aqiTitle.textContent = 'Air Quality Index';
    pollutionAlert();
    latitude = json.data.city.geo[0];
    longitude = json.data.city.geo[1];
    mapZoom = 9;
    buildMap(latitude, longitude, mapZoom);
    tableManager();
}

function writeData(jsonData, id, unit) {
    if (jsonData) {
        data[id].innerHTML = `<td class="type">${unit}</td><td>${jsonData}</td>`;
    }
}

function tableManager() {
    if (json.data.iaqi.pm25.v || json.data.iaqi.pm10.v || json.data.iaqi.so2.v) {
        theads[0].textContent = 'Air Quality Data';
        writeData(json.data.iaqi.pm25.v, 4, 'PM<sub>2.5</sub> [μg/mc]');
        writeData(json.data.iaqi.pm10.v, 5, 'PM<sub>10</sub> [μg/mc]');
        writeData(json.data.iaqi.so2.v, 6, 'SO<sub>2</sub> [μg/mc]');
    }
    if (json.data.iaqi.t.v || json.data.iaqi.p.v || json.data.iaqi.h.v || json.data.iaqi.w.v) {
        theads[1].textContent = 'Weather Information';
        writeData(json.data.iaqi.t.v, 7, 'Temperature [°C]');
        writeData(json.data.iaqi.p.v, 8, 'Pressure [mb]');
        writeData(json.data.iaqi.h.v, 9, 'Humidity [%]');
        writeData(json.data.iaqi.w.v, 10, 'Wind [m/s]');
    }
}

function alternativeDataManager(json) {
    data[0].textContent = json.results[0].n[1];
    data[1].textContent = json.results[0].n.join(', ');
    let lastRelevation = new Date(json.results[0].s.t[0]);
    timeDataManager(lastRelevation);
    data[3].textContent = json.results[0].s.a;
    aqiTitle.textContent = 'Air Quality Index';
    pollutionAlert();
    latitude = 0;
    longitude = 0;
    mapZoom = 1;
    buildMap(latitude, longitude, mapZoom);
}

function dataEraser() {
    for (let content of data) {
        content.textContent = '';
    }
    for (let thead of theads) {
        thead.textContent = '';
    }
    aqiTitle.textContent = '';
    reduceMapOn();
}

// GEOLOCATOR

let firstAccess = true;
let json;
let geolocatorLat;
let geolocatorLon;
const geolocator = document.querySelector('#geolocator');
const delay = ms => new Promise(res => setTimeout(res, ms));

navigator.geolocation.getCurrentPosition(success, error);

function success(pos) {
    let crd = pos.coords;
    geolocatorLat = crd.latitude;
    geolocatorLon = crd.longitude;
}

function error(err) {
    if (err.code == 1) {
        console.log('Geolocalizzazione non abilitata.');
    } else {
        console.warn(`ERROR(${err.code}): ${err.message}`);
    }
}

async function getDataGeolocator() {
    try {
        let url = `https://api.waqi.info/feed/geo:${geolocatorLat};${geolocatorLon}/?token=${APIkey}`;
        let response = await fetch(url);
        json = await response.json();
        if (geolocatorLat && geolocatorLon) {
            data[0].textContent = 'THE NEAREST MONITORING STATION';
            dataManager(json);
        } else {
            data[0].textContent = 'Please allow geolocation and try again!';
            navigator.geolocation.getCurrentPosition(success, error);
            buildMap(0, 0, 1);
        }
    } catch (err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
    }
}

async function geolocatorOn() {
    if (firstAccess) {
        dataEraser();
        await removeList();
        getDataGeolocator();
        flipCardOn();
        firstAccess = false;
    } else {
        dataEraser();
        await removeList();
        flipCardOff();
        await delay(3000);
        getDataGeolocator();
        flipCardOn();
    }
}

geolocator.addEventListener('click', geolocatorOn);

// SEARCH BY KEYWORD

let cityName = document.querySelector('#city-name');
const glass = document.querySelector("#glass");

async function getData() {
    try {
        let keyword = cityName.value;
        let url = `https://api.waqi.info/feed/${keyword}/?token=${APIkey}`;
        let response = await fetch(url);
        json = await response.json();
        dataManager(json);
        console.log(json);
        let name = json.data.city.name.split(', ');
        data[0].textContent = name[1];
    } catch (err) {
        if (err.message == 'Failed to fetch' || err.message == "Cannot read property 'name' of undefined") {
            getAlternativeData();
        } else {
            console.warn(`ERROR(${err.code}): ${err.message}`);
        }
    }
}

async function getAlternativeData() {
    let keyword = cityName.value;
    try {
        let url = `https://search.waqi.info/nsearch/full/${keyword}`;
        let response = await fetch(url);
        json = await response.json();
        alternativeDataManager(json);
        data[0].textContent = json.results[0].n[1];
    } catch (err) {
        data[0].innerHTML = `Data for "${cityName.value.toUpperCase()}" are not available. </br>Please try another keyword.`;
        buildMap(0, 0, 1);
        aqiTitle.textContent = '';
        console.warn(`ERROR(${err.code}): ${err.message}`);
    }
}

async function getDataByKeyword() {
    try {
        let keyword = cityName.value;
        let url = `https://api.waqi.info/feed/${keyword}/?token=${APIkey}`;
        let response = await fetch(url);
        json = await response.json();
        dataManager(json);
        data[0].textContent = cityName.value.toUpperCase();
    } catch (err) {
        if (err.message == 'Failed to fetch' || err.message == "Cannot read property 'name' of undefined") {
            data[0].innerHTML = `Data for "${cityName.value.toUpperCase()}" are not available. </br>Please try another keyword.`;
            buildMap(0, 0, 1);
            aqiTitle.textContent = '';
        } else {
            console.warn(`ERROR(${err.code}): ${err.message}`);
        }
    }
}

async function searchOn() {
    if (cityName.value) {
        if (firstAccess) {
            await removeList();
            getData();
            flipCardOn();
            firstAccess = false;
        } else {
            dataEraser();
            await removeList();
            flipCardOff();
            await delay(3000);
            getData();
            flipCardOn();
        }
    }
}

async function searchOnKeyword() {
    if (cityName.value) {
        if (firstAccess) {
            await removeList();
            getDataByKeyword();
            await removeList();
            flipCardOn();
            firstAccess = false;
        } else {
            dataEraser();
            await removeList();
            flipCardOff();
            await delay(3000);
            getDataByKeyword();
            await removeList();
            flipCardOn();
        }
    }
}

glass.addEventListener('click', searchOnKeyword);

// LIST CREATION AND MANAGEMENT

const placeholder = document.querySelector('#placeholder');
const list = document.querySelector("#submenu");
let id = -1;
let height;

async function getCityName() {
    let keyword = cityName.value;
    try {
        let url = `https://search.waqi.info/nsearch/full/${keyword}`;
        let response = await fetch(url);
        json = await response.json();
        return json.results;
    } catch (err) {
        if (err.message !== "Cannot read property 'name' of undefined") {
            console.warn(`ERROR DURING GET CITY NAME(${err.code}): ${err.message}`);
        }
    }
}

function getList(cities) {
    let cityList = [];
    for (let city of cities) {
        cityList.push(city.n.join(', '));
    }
    return cityList;
}

function createDropdownList(cityList) {
    for (let name of cityList) {
        let listItem = document.createElement("LI");
        listItem.tabIndex = '0';
        list.appendChild(listItem);
        let text = document.createTextNode(name);
        listItem.appendChild(text);
    }
}

async function removeList() {
    id = -1;
    list.style.maxHeight = '0';
    await delay(500);
    removeListElements();
}

function removeListElements() {
    for(let element of list.children) {
        element.remove();
    }
}

function maxListHeight() {
    let totalHeight = document.body.scrollHeight;
    let infoList = list.getBoundingClientRect();
    height = totalHeight - infoList.top;
}

async function createList() {
    await delay(500);
    let city = await getCityName();
    let cityList = getList(city);
    createDropdownList(cityList);
    maxListHeight();
    list.style.maxHeight = height + 'px';
    if (!cityName.value) {
        removeList();
    }
}

cityName.oninput = function () {
    removeList();
    createList();
}

function selectCity(e) {
    cityName.value = e.target.textContent;
    searchOn();
}

list.addEventListener('click', selectCity);

function slideCity(e) {
    if (e.code == 'ArrowDown') {
        e.preventDefault();
        if (id < list.childElementCount - 1) {
            id++;
            list.children[id].focus();
            list.children[id].scrollIntoView({ behavior: "smooth", block: 'center' });
        } else {
            list.children[id].focus();
        }
    } else if (e.code == 'ArrowUp') {
        e.preventDefault();
        if (id > 0) {
            id--;
            list.children[id].focus();
            list.children[id].scrollIntoView({ behavior: "smooth", block: 'center' });
        } else {
            list.children[id].focus();
        }
    } else if (e.code == 'Enter') {
        if (e.target == cityName) {
            cityName.blur();
            searchOnKeyword();
        } else {
            selectCity(e);
        }
    }
}

placeholder.addEventListener('keydown', slideCity);

// MAP

const expandMap = document.querySelector('.expand');
const reduceMap = document.querySelector('.reduce');
const expandMapTablet = document.querySelector('.expand-tablet');
const map = document.querySelector('#pollution-map');
const map2 = document.querySelector('#map');
const mapContainer = document.querySelector('.map-container');
const dataDisplay = document.querySelector('#data-display');
const tablesContainer = document.querySelector('#tables-container');
const mapInstruction = document.querySelector('.map-instruction');
let alreadyExpanded = false;
let canReduce = false;

function buildMap(lat, long, zoom) {
    const map = document.querySelector('#map');
    map.innerHTML = '<div id="pollution-map"></div>';
    var OSM_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var OSM_ATTRIB = '&copy;  <a  href="http://openstreetmap.org/copyright">OpenStreetMap</a>  contributors';
    var osmLayer = L.tileLayer(OSM_URL, { attribution: OSM_ATTRIB });

    var WAQI_URL = `https://tiles.waqi.info/tiles/usepa-aqi/{z}/{x}/{y}.png?token=${APIkey}`;
    var WAQI_ATTR = 'Air  Quality  Tiles  &copy;  <a  href="http://waqi.info">waqi.info</a>';
    var waqiLayer = L.tileLayer(WAQI_URL, { attribution: WAQI_ATTR });

    var pollutionMap = L.map('pollution-map').setView([lat, long], zoom);
    pollutionMap.addLayer(osmLayer).addLayer(waqiLayer);

    async function onMapClick(e) {
        dataEraser();
        await getMapData(e.latlng.lat, e.latlng.lng);
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
        await reduceMapOn();
    }

    pollutionMap.on('dblclick', onMapClick);
}

async function getMapData(lat, lng) {
    try {
        let url = `https://api.waqi.info/feed/geo:${lat};${lng}/?token=${APIkey}`;
        let response = await fetch(url);
        json = await response.json();
        data[0].textContent = 'NEAREST STATION FROM SELECTION';
        dataManager(json);
    } catch (err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
    }
}

function mapSizerClick(e) {
    if (e.target == expandMap) {
        expandMapOn();
    } else if (e.target == reduceMap) {
        reduceMapOn();
    } else if (e.target == expandMapTablet) {
        expandMapTabletOn();
    }
}

dataDisplay.addEventListener('click', mapSizerClick);

mapContainer.onmouseenter = function () {
    if (!alreadyExpanded && mapContainer.offsetHeight == 390) {
        alreadyExpanded = true;
        expandMapOn();
    }
}

mapContainer.onmouseleave = function () {
    if (alreadyExpanded && mapContainer.offsetHeight == 390 && canReduce) {
        reduceMapOn();
        canReduce = false;
    }
}

async function reduceMapOn() {
    mapContainer.style.zIndex = '-1';
    mapInstruction.classList.remove('map-instruction-active');
    mapContainer.style.width = '';
    mapContainer.style.height = '';
    mapContainer.style.position = '';
    document.body.style.overflow = '';
    map2.style.zIndex = '';
    tablesContainer.style.opacity = '';
    expandMap.style.display = '';
    expandMapTablet.style.display = '';
    reduceMap.style.display = '';
    await delay(1000);
    tablesContainer.style.marginRight = '';
    tablesContainer.style.width = '';
    tablesContainer.style.height = '';
    await delay(600);
    tablesContainer.style.color = '';
    alreadyExpanded = false;
    mapContainer.style.zIndex = '';
    canReduce = false;
}

async function expandMapOn() {
    mapContainer.style.zIndex = '-1';
    tablesContainer.style.color = 'transparent';
    await delay(600);
    tablesContainer.style.width = 0;
    tablesContainer.style.marginRight = 0;
    mapContainer.style.width = '684px';
    await delay(1000);
    mapInstruction.classList.add('map-instruction-active');
    buildMap(latitude, longitude, mapZoom);
    await delay(1000);
    canReduce = true;
    mapContainer.style.zIndex = '';
}

async function expandMapTabletOn() {
    mapInstruction.classList.add('map-instruction-active');
    tablesContainer.style.opacity = '0';
    mapContainer.style.position = 'fixed';
    mapContainer.scrollIntoView({ inline: 'start', block: 'start' });
    mapContainer.style.width = '100vw';
    mapContainer.style.height = '100vh';
    document.body.style.overflow = 'hidden';
    map2.style.zIndex = '-1';
    expandMapTablet.style.display = 'none';
    reduceMap.style.display = 'flex';
    await delay(700);
    buildMap(latitude, longitude, mapZoom);
}



