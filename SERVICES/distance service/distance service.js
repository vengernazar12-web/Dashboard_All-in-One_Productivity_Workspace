const distanceServiceWrap = document.querySelector('.distance-service-wrap');
// Open
const openDistanceServiceBtn = allDashboardItem.querySelector('.open-distance-service-wrap');
openDistanceServiceBtn.addEventListener('click', () => {
  closeAllWraps();
  distanceServiceWrap.classList.add('show');

  history.pushState(null, {}, '#distanceBetweenPlaces');
});

const distanceServiceLoader = distanceServiceWrap.querySelector('span.loader');
const distanceServiceResultCont = distanceServiceWrap.querySelector('div');

const distanceServiceSearchAPI = 'https://www.how-far-is.com/api/v1/places?q=';
const distanceServiceGetDistanceAPI = 'https://www.how-far-is.com/api/v1/distance?';

const distanceServiceFirstPointDatalist = distanceServiceWrap.querySelector('datalist#first');
const distanceServiceSecondPointDatalist = distanceServiceWrap.querySelector('datalist#second');

let distanceServiceDebounceTimer = null;
const distanceServiceFirstPointInput = distanceServiceWrap.querySelector('input.first');
distanceServiceFirstPointInput.addEventListener('input', () => {
  clearTimeout(distanceServiceDebounceTimer);

  distanceServiceDebounceTimer = setTimeout(async () => {
    const val = distanceServiceFirstPointInput.value.trim();
    if(!val || val.length > 25) return distanceServiceFirstPointDatalist.textContent = '';

    distanceServiceFirstPointDatalist.innerHTML = await fetch(`${distanceServiceSearchAPI}${val}`)
      .then(r => r.json())
      .then(d => d.results.map(res => `<option value='${res.slug}'>${res.countryName} | ${res.name} | ${res.population} people</option>`).join(''));
  }, 500);
})

const distanceServiceSecondPointInput = distanceServiceWrap.querySelector('input.second');
distanceServiceSecondPointInput.addEventListener('input', () => {
  clearTimeout(distanceServiceDebounceTimer);

  distanceServiceDebounceTimer = setTimeout(async () => {
    const val = distanceServiceSecondPointInput.value.trim();
    if(!val || val.length > 25) return distanceServiceSecondPointDatalist.textContent = '';

    distanceServiceSecondPointDatalist.innerHTML = await fetch(`${distanceServiceSearchAPI}${val}`)
      .then(r => r.json())
      .then(d => d.results.map(res => `<option value='${res.slug}'>${res.countryName} | ${res.name} | ${res.population} people</option>`).join(''));
  }, 500);
})

const distanceServiceSendBtn = distanceServiceWrap.querySelector('button.send');
distanceServiceSendBtn.addEventListener('click', async () => {
  const val1 = distanceServiceFirstPointInput.value.trim();
  const val2 = distanceServiceSecondPointInput.value.trim();

  if(!val1 || !val2) return;
  if(val1.length > 25 || val2.length > 25) return showResponseFn('Points is too long.');

  distanceServiceSendBtn.disabled = true;
  distanceServiceLoader.style.display = 'block';
  distanceServiceResultCont.textContent = '';

  distanceServiceResultCont.innerHTML = await fetch(`${distanceServiceGetDistanceAPI}from=${distanceServiceFirstPointInput.value.trim()}&to=${distanceServiceSecondPointInput.value.trim()}`)
    .then(r => r.json())
    .then(d => `
<div class='distance-route'>
  <div class='from'>
    <h4>${d.from.countryName} | ${d.from.name}</h4>
    <span>${d.from.country}</span>

    <p>Population: <strong>${Number(d.from.population).toLocaleString()}</strong></p>
    <p>Continent: <strong>${d.from.continent}</strong></p>
    <p>${d.from.lat}, ${d.from.lng}</p>
  </div>

  <div class='route-arrow'>→</div>

  <div class='to'>
    <h4>${d.to.countryName} | ${d.to.name}</h4>
    <span>${d.to.country}</span>

    <p>Population: <strong>${Number(d.to.population).toLocaleString()}</strong></p>
    <p>Continent: <strong>${d.to.continent}</strong></p>
    <p>${d.to.lat}, ${d.to.lng}</p>
  </div>

</div>

<div class='distance'>
  <strong>${d.distance.km.toLocaleString()} km</strong>
  <span>${d.distance.mi.toLocaleString()} mi · ${d.distance.nmi.toLocaleString()} nmi</span>
</div>

<div class='distance-details'>

  <div>
    <span>Flight</span>
    <strong>${d.flight.label}</strong>
  </div>

  <div>
    <span>Time difference</span>
    <strong>${d.time.label}</strong>
  </div>

  <div>
    <span>Initial bearing</span>
    <strong>${d.bearing.initial}° ${d.bearing.initialCompass}</strong>
  </div>

  <div>
    <span>Final bearing</span>
    <strong>${d.bearing.final}° ${d.bearing.finalCompass}</strong>
  </div>

</div>

<details class='distance-more'>
  <summary>More information</summary>

  <div>
    <p>Midpoint: <strong>${d.midpoint.lat}, ${d.midpoint.lng}</strong></p>

    <p>${d.from.name} timezone:
      <strong>${d.from.timezone}</strong>
    </p>

    <p>${d.to.name} timezone:
      <strong>${d.to.timezone}</strong>
    </p>

    <p>Local time:
      <strong>${d.from.name} ${d.time.fromLocal}</strong>
      →
      <strong>${d.to.name} ${d.time.toLocal}</strong>
    </p>
  </div>
</details>

<small class='distance-source'>
  Data: GeoNames · how-far-is.com
</small>
`).finally(() => {
  distanceServiceSendBtn.disabled = false;
  distanceServiceLoader.style.display = 'none';
});
});