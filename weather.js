const WORKER_WEATHER_API = 'https://weather-fetch.vengernazar0.workers.dev/';

const weatherWrap = document.querySelector('.weather-wrap');
weatherWrap.addEventListener('click', e => {
  if(
    searchCityWindow.classList.contains('open')
    && e.target.tagName !== 'BUTTON'
    && !e.target.closest('.search-city-window')
  ) searchCityWindow.classList.remove('open');

  else if(!e.target.closest('.weather-map') && !e.target.closest('.open-map')) {
    weatherMapBlock.classList.remove('open');
    weatherMapBlock.firstElementChild.src = '';
  }
})
// Open
const openWeatherWrapBtn = allDashboardItem.querySelector('.open-weather-wrap');
openWeatherWrapBtn.addEventListener('click', async () => {
  if(weatherWrap.classList.contains('show')) return;
  closeAllWraps();

  const savedCityInfo = JSON.parse(localStorage.getItem('city-info'));

  if(savedCityInfo) {
    showPreloader();
    preloaderProgress.max = 1;
    preloaderProgress.value = 0;
    whatIsLoadingText.textContent = 'Loading saved point weather...';

    await renderInfo(savedCityInfo.city, savedCityInfo.coord);

    preloaderProgress.value = 1;
    setTimeout(() => showPreloader(false), 500);
  }

  weatherWrap.classList.add('show');
});

// All weather blocks
const searchCityWindow = weatherWrap.querySelector('.search-city-window');

// Container delegation
const searchCityCont = searchCityWindow.querySelector('.all-found-cities-cont');
searchCityCont.addEventListener('click', async e => {
  if(e.target.tagName === 'P') {
    searchCityWindow.classList.remove('open');
    const city = e.target.textContent;
    const coord = e.target.dataset.coordinates;
    await renderInfo(city, coord);
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
    const resp = await fetch(WORKER_WEATHER_API, {
      method: 'POST',
      headers: {'Content-Type': 'application/json',},
      body: JSON.stringify({
        point: txt,
        need: 'search',
      })
    });
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

// render info
async function renderInfo(city, coordinates) {
  const resp = await fetch(WORKER_WEATHER_API, {
    method: 'POST',
    headers: {'Content-Type': 'application/json',},
    body: JSON.stringify({
      point: coordinates,
      need: 'info',
    })
  });
  const info = await resp.text();

  weatherInfoBlock.innerHTML = info;
  weatherInfoBlock.dataset.coord = coordinates;
}

// Weather map
const weatherMapBlock = weatherWrap.querySelector('.weather-map');
// Open weather map
weatherWrap.querySelector('.open-map')
.addEventListener('click', () => {
  const coord = weatherInfoBlock.dataset.coord.split(',');
  weatherMapBlock.firstElementChild.src = `https://embed.windy.com/embed2.html?lat=${coord[0]}&lon=${coord[1]}&detailLat=${coord[0]}&detailLon=${coord[1]}&zoom=7&level=surface&overlay=wind`;

  weatherMapBlock.classList.add('open');
});