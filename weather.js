// Set progress text
whatIsLoadingText.textContent = 'Loading weather logic...';

// Api
const WEATHER_API = 'http://api.weatherapi.com/v1/';
const WEATHER_KEY = '22e4bbfc56e94f04b50101532260302';

const weatherWrap = document.querySelector('.weather-wrap');
weatherWrap.addEventListener('click', e => {
  if(
    searchCityWindow.classList.contains('open')
    && e.target.tagName !== 'BUTTON'
    && !e.target.closest('.search-city-window')
  ) searchCityWindow.classList.remove('open');
})
// Open
const openWeatherWrapBtn = allDashboardItem.querySelector('.open-weather-wrap');
openWeatherWrapBtn.addEventListener('click', () => {
  const savedCityInfo = JSON.parse(localStorage.getItem('city-info'));
  if(savedCityInfo) {
    showPreloader();
    renderInfo(savedCityInfo.city, savedCityInfo.coord);
    showPreloader(false);
  }
  weatherWrap.classList.add('show');
});
// Close
weatherWrap.querySelector('.close-weather-wrap-btn')
.addEventListener('click', () => {
  weatherWrap.classList.remove('show');
  showBodyScroll();
});

// All weather blocks
const searchCityWindow = weatherWrap.querySelector('.search-city-window');

// Container delegation
const searchCityCont = searchCityWindow.querySelector('.all-found-cities-cont');
searchCityCont.addEventListener('click', e => {
  if(e.target.tagName === 'P') {
    searchCityWindow.classList.remove('open');
    const city = e.target.textContent;
    const coord = e.target.dataset.coordinates;
    renderInfo(city, coord);
    localStorage.setItem('city-info', JSON.stringify({city, coord}))
  }
})

const weatherInfoBlock = weatherWrap.querySelector('.weather-info-block');

// Open search city window
weatherWrap.querySelector('.open-search-city-window')
.addEventListener('click', () => searchCityWindow.classList.add('open'));

// Search city input
const searchCityInput = searchCityWindow.querySelector('.search-city-input');
searchCityInput.addEventListener('input', () => {
  const value = searchCityInput.value;
  if(value) renderFoundCities(value);
  else {
    clearTimeout(searchCityTimer);
    searchCityCont.innerHTML = '<h2>City/country...</h2>';
  };
})

// City search
let searchCityTimer = null;
function renderFoundCities(txt) {
  clearTimeout(searchCityTimer);
  searchCityTimer = setTimeout(async () => {
    const resp = await fetch(`${WEATHER_API}search.json?key=${WEATHER_KEY}&q=${txt}`);
    const data = await resp.json();

    searchCityCont.textContent = '';
    const frag = document.createDocumentFragment();
    for(let obj of data) {
      const p = document.createElement('p');
      p.textContent = `${obj.country}, ${obj.name}`;
      p.dataset.coordinates = `${obj.lat},${obj.lon}`;
      frag.appendChild(p);
    }
    searchCityCont.appendChild(frag);
  }, 1250);
}

// City getter
async function getCityInfo(point) {
  const resp = await fetch(`${WEATHER_API}current.json?key=${WEATHER_KEY}&q=${point}`);
  const data = await resp.json();
  return data.current;
}

// All info elements
const WCityName = weatherInfoBlock.querySelector('.city-name');
const WLastUpdate = weatherInfoBlock.querySelector('.last-update-txt');
const WTempTxt = weatherInfoBlock.querySelector('.temperature-txt');
const WFeelsLikeTxt = weatherInfoBlock.querySelector('.feels-like-txt');
const WWindTxt = weatherInfoBlock.querySelector('.wind-txt');
const WHumidityTxt = weatherInfoBlock.querySelector('.humidity-txt');
const WCloudTxt = weatherInfoBlock.querySelector('.cloud-txt');
const WPressTxt = weatherInfoBlock.querySelector('.pressure-txt');
const weatherText = weatherInfoBlock.querySelector('.weather-text');
const weatherIcon = weatherInfoBlock.querySelector('.weather-icon');

// render info
let renderDefendTimer = null;
function renderInfo(city, coordinates) {
  clearTimeout(renderDefendTimer);
  renderDefendTimer = setTimeout(async () => {
  const info = await getCityInfo(coordinates);

  WCityName.textContent = city;
  WLastUpdate.textContent = `Last update: ${info.last_updated}`;

  WTempTxt.textContent = `Temperature: ${info.temp_c}°C`;
  WFeelsLikeTxt.textContent = `Feels like: ${info.feelslike_c}°C`;

  WWindTxt.textContent = `Wind: ${info.wind_kph} kph ${info.wind_dir}`;

  WHumidityTxt.textContent = `Humidity: ${info.humidity}%`;
  WCloudTxt.textContent = `Cloud: ${info.cloud}%`;

  WPressTxt.textContent = `Pressure: ${info.pressure_mb} mb`;

  weatherText.textContent = info.condition.text;
  weatherIcon.src = info.condition.icon;
  }, 150);
}

// Set progress value
preloaderProgress.value = 8;