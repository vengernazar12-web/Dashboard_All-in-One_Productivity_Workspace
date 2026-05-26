const WORKER_TIMEZONE_API = 'https://timezone-fetch.vengernazar0.workers.dev';

async function initAllTimezones() {
  try {
    const resp = await fetch(WORKER_TIMEZONE_API, {
      method: 'POST',
      headers: {'Content-Type': 'application/json',},
      body: JSON.stringify({
        timeZone: '',
        need: 'list',
      })
    });
    const data = await resp.json();
    timezonesArr = data.zones;
  } catch {
    showPreloader(false);
    showBodyScroll();
    return showResponseFn('Something went wrong...');
  }

  renderTimezoneSelects();
  renderTimezones();
}

const timezoneWrap = document.querySelector('.timezone-wrap');
timezoneWrap.addEventListener('click', e => {
  const target = e.target;
  if(!target.closest('.time-zone-info-block') && showZoneTimeBlock.classList.contains('open')) {
    showZoneTimeBlock.classList.remove('open');
  }
})
// Open
const openTimezoneWrapBtn = allDashboardItem.querySelector('.open-timezone-wrap');
openTimezoneWrapBtn.addEventListener('click', async () => {
  if(timezoneWrap.classList.contains('show')) return;
  closeAllWraps();
  preloaderProgress.max = 1;
  preloaderProgress.value = 0;
  whatIsLoadingText.textContent = 'Start...';
  showPreloader();

  searchTimezonesInput.value = '';

  if(!timezonesArr.length) await initAllTimezones();

  preloaderProgress.value = 1;
  whatIsLoadingText.textContent = 'Yes!';

  setTimeout(() => showPreloader(false), 500);
  showResponseFn('Time zones rendered')
  timezoneWrap.classList.add('show');
})

// Timezones arr
let timezonesArr = [];
let initUsedTimezonesArr = [];

// Time zone info
const showZoneTimeBlock = timezoneWrap.querySelector('.time-zone-info-block');
const timeZoneTitleTxt = showZoneTimeBlock.firstElementChild;
const timeZoneTimeTxt = showZoneTimeBlock.lastElementChild;

// Show time zone info fn
let timeZoneInfoTimer = null;
function showTimeZoneInfo(timeZone) {
  if(timeZoneInfoTimer !== null) return showResponseFn('You already have a request in progress!');

  clearTimeout(timeZoneInfoTimer);
  timeZoneInfoTimer = setTimeout(async () => {
    try {
      const resp = await fetch(WORKER_TIMEZONE_API, {
        method: 'POST',
        headers: {'Content-Type': 'application/json',},
        body: JSON.stringify({
          timeZone: timeZone,
          need: 'time',
        })
      });
      const data = await resp.json();

      timeZoneTitleTxt.textContent = `${data.countryCode} | ${data.countryName}\nTime zone: ${data.zoneName}`;
      timeZoneTimeTxt.textContent = `
${data.formatted.replace(' ', '\n')}\n${data.abbreviation}
---
DST: ${!!(+data.dst)}
`.trim();

      showZoneTimeBlock.classList.add('open');
      timeZoneInfoTimer = null;
    } catch(e) {
      console.error(e);
      showResponseFn('Sorry, something went wrong...');
    }
  });
}

// All timezones container
const allTimezonesCont = timezoneWrap.querySelector('.all-timezones-container');
allTimezonesCont.addEventListener('click', e => {
  if(showZoneTimeBlock.classList.contains('open')) return showZoneTimeBlock.classList.remove('open');
  const val = e.target.dataset?.value;
  if(val) showTimeZoneInfo(val);
})

// Render select options
function renderTimezoneSelects() {
  const set = new Set(timezonesArr.map(o => o.zoneName.split('/')[0]));

  selectTimezone.textContent = '';

  const frag = document.createDocumentFragment();

  for(let reg of set) {
    const o = document.createElement('option');
    o.textContent = reg;
    o.value = reg;
    frag.appendChild(o);
  }
  // Add "all" option
  const option = document.createElement('option');
  option.textContent = 'All';
  option.value = 'All';
  frag.appendChild(option);
  // Add all options
  selectTimezone.appendChild(frag);

  const savedValue = localStorage.getItem('timezone');
  selectTimezone.value = savedValue ? savedValue : 'All';
}

// Render timezones
function renderTimezones() {
  initUsedTimezonesArr = [];
  const v = selectTimezone.value;

  allTimezonesCont.textContent = '';

  const frag = document.createDocumentFragment();

  if(v === 'All') {
    for(let t of timezonesArr) {
      const pre = document.createElement('pre');
      pre.textContent = `${t.countryCode} | ${t.countryName}\nZone: ${t.zoneName}`;
      pre.dataset.value = t.zoneName;
      frag.appendChild(pre);
      initUsedTimezonesArr.push(t);
    }
  }
  else {
    for(let t of timezonesArr) {
      if(t.zoneName.startsWith(v)) {
        const pre = document.createElement('pre');
        pre.textContent = `${t.countryCode} | ${t.countryName}\nZone: ${t.zoneName}`;
        pre.dataset.value = t.zoneName;
        frag.appendChild(pre);
        initUsedTimezonesArr.push(t);
      }
    }
  }

  allTimezonesCont.appendChild(frag);
}

// Select timezone
const selectTimezone = timezoneWrap.querySelector('.select-timezone');
selectTimezone.addEventListener('change', () => {
  searchTimezonesInput.value = '';
  renderTimezones();
  localStorage.setItem('timezone', selectTimezone.value);
})

// Search timezones input
let searchTimeZonesTimer = null;
const searchTimezonesInput = timezoneWrap.querySelector('.search-timezone-input');
searchTimezonesInput.addEventListener('keydown', e => {
  if(e.key === '|') return e.preventDefault();
})
searchTimezonesInput.addEventListener('input', () => {
  const val = searchTimezonesInput.value.toLowerCase().trim();
  if(!val) return renderTimezones();
  else renderFoundTimezones(val);
})

function renderFoundTimezones(val) {
  const safeVal = val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regExp = new RegExp(safeVal, 'gi');

  allTimezonesCont.textContent = '';
  const frag = document.createDocumentFragment();

  for(let t of initUsedTimezonesArr) {
    const text = `${t.countryCode} | ${t.countryName}\nZone: ${t.zoneName}`;
    if(text.toLowerCase().includes(val)) {
      const pre = document.createElement('pre');
      pre.innerHTML = text.replace(regExp, '<mark>$&</mark>');
      pre.dataset.value = t.zoneName;
      frag.appendChild(pre);
    }
  }
  allTimezonesCont.appendChild(frag);
}