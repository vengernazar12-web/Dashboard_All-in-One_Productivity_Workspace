// Set progress text
whatIsLoadingText.textContent = 'Loading services...';

const exchangeRateWrap = document.querySelector('.exchange-rate-wrap');
// Open
let flagsCssLoaded = false;
const openExchangeRateWrapBtn = allDashboardItem.querySelector('.open-exchange-rate-wrap');
openExchangeRateWrapBtn.addEventListener('click', async () => {
  if(exchangeRateWrap.classList.contains('show')) return;

  if(!flagsCssLoaded) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/currency-flags@4.0.7/dist/currency-flags.min.css';
    header.appendChild(link);
    flagsCssLoaded = true;
  }

  closeAllWraps();
  preloaderProgress.max = 1;
  preloaderProgress.value = 0;
  whatIsLoadingText.textContent = 'Loading exchange rate...';
  showPreloader();
  showResponseFn('Please wait...');

  await renderExchangeRateSelects();

  exchangeRateWrap.classList.add('show');

  preloaderProgress.value = 1;
  setTimeout(() => showPreloader(false), 500);
  showResponseFn('Exchange rate are been loaded');
});

// Api
const EX_API = 'https://v6.exchangerate-api.com/v6/3823f0dc50f06c6954ddca0d/latest/';
// All rates
let rates = {};

// Rate text info
const rateTextInfo = exchangeRateWrap.querySelector('.exchange-rate-answer');
const howRateText = exchangeRateWrap.querySelector('.how-rate-text');

// Rate calculator input
const rateCalcInput = exchangeRateWrap.querySelector('.rate-calc-input');
rateCalcInput.addEventListener('beforeinput', e => {
  if(!/^[0-9.]+$/.test(e.data) && e.data !== null) return e.preventDefault();
})
rateCalcInput.addEventListener('input', () => {
  const val1 = firstSelect.value;
  const val2 = secondSelect.value;

  let inputVal = rateCalcInput.value;
  if(!inputVal) inputVal = '0';
  if(inputVal.endsWith('.')) inputVal += '0';
  if(inputVal.startsWith('.')) inputVal = '0' + inputVal;

  howRateText.textContent = `${val1} = ${+inputVal * rates[val2]} ${val2}`;
})

// Selectors
const firstSelect = exchangeRateWrap.querySelector('.first-select');
const secondSelect = exchangeRateWrap.querySelector('.second-select');

firstSelect.addEventListener('change', async () => {
  await initRates(firstSelect.value, true, [firstSelect.value, null]);
  localStorage.setItem('first-select', firstSelect.value);
});
secondSelect.addEventListener('change', () => {
  setRateInfo([null, secondSelect.value]);
  localStorage.setItem('second-select', secondSelect.value);
});

// Render selectors
async function renderExchangeRateSelects() {
  firstSelect.textContent = '';
  secondSelect.textContent = '';

  const sesVal1 = localStorage.getItem('first-select');
  const sesVal2 = localStorage.getItem('second-select');

  await initRates(sesVal1);

  const frag = document.createDocumentFragment();
  const frag2 = document.createDocumentFragment();
  for(let n in rates) {
    const option = document.createElement('option');
    option.value = n;
    option.textContent = n;
    frag.appendChild(option);

    const option2 = document.createElement('option');
    option2.value = n;
    option2.textContent = n;
    frag2.appendChild(option2);
  }
  // Append fragments
  firstSelect.appendChild(frag);
  secondSelect.appendChild(frag2);

  firstSelect.value = sesVal1 ? sesVal1 : 'USD';
  secondSelect.value = sesVal2 ? sesVal2 : 'USD';

  setRateInfo([firstSelect.value, secondSelect.value]);
}

// Init rates
async function initRates(rate, ignoreCache = false, changedValues = []) {
  try{
    const savedRates = JSON.parse(sessionStorage.getItem('rates'));
    if(!ignoreCache && savedRates) rates = savedRates;
    else {
      const resp = await fetch(`${EX_API}${rate ? rate : 'USD'}`);
      const data = await resp.json();
      rates = data.conversion_rates;
      sessionStorage.setItem('rates', JSON.stringify(rates));
    }
  } catch { showResponseFn('Something went wrong! Please try again later...') };

  if(rate) setRateInfo(changedValues);
}

// Set rate info
const firstFlagImgBlock = exchangeRateWrap.querySelector('.first-flag');
const secondFlagImgBLock = exchangeRateWrap.querySelector('.second-flag');

let cachedFlags = {};
async function setRateInfo(values) {
  const val1 = firstSelect.value;
  const val2 = secondSelect.value;

  rateTextInfo.textContent = `1 ${val1} = ${rates[val2]} ${val2}`;

  rateCalcInput.value = '';
  howRateText.textContent = `${val1} = ... ${val2}`;

  if(!values.length) return;

  try {
    const value1 = values[0]?.toLowerCase();
    if(value1) firstFlagImgBlock.className = `first-flag currency-flag currency-flag-${value1}`;

    const value2 = values[1]?.toLowerCase();
    if(value2) secondFlagImgBLock.className = `second-flag currency-flag currency-flag-${value2}`;
  } catch(e) { console.error(e.message); }
}

// Swap selector
const swapSelectsBtn = exchangeRateWrap.querySelector('.swap-selects');
swapSelectsBtn.addEventListener('click', async () => {
  swapSelectsBtn.disabled = true;
  const val1 = firstSelect.value;
  firstSelect.value = secondSelect.value;
  secondSelect.value = val1;
  await initRates(firstSelect.value, true, [firstSelect.value, secondSelect.value]);
  setTimeout(() => swapSelectsBtn.disabled = false, 5000);
})

// Set progress value
preloaderProgress.value = 2;