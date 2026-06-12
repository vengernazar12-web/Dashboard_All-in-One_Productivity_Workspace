// Set progress text
whatIsLoadingText.textContent = 'Loading services...';

const exchangeRateWrap = document.querySelector('.exchange-rate-wrap');
exchangeRateWrap.addEventListener('click', e => {
  const target = e.target;
  const closestCurrBlock = target.closest('.curr-block');

  if(closestCurrBlock) {
    const curr = closestCurrBlock.dataset.curr;
    const savedFavs = JSON.parse(localStorage.getItem('fav-currencies') || "[]");

    if(savedFavs.includes(curr)) localStorage.setItem('fav-currencies', JSON.stringify(savedFavs.filter(c => c !== curr)));
    else {
      savedFavs.push(curr);
      localStorage.setItem('fav-currencies', JSON.stringify(savedFavs));
    }
  }

  renderExchangeRateResults();
})
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
  if(needPushState) history.pushState({}, null, '#exchange-rate');
  preloaderProgress.max = 1;
  preloaderProgress.value = 0;
  whatIsLoadingText.textContent = 'Loading exchange rate...';
  showPreloader();
  showResponseFn('Please wait...');

  exchangeRateCurrencyInput.value = 1;

  currencyMetadata = await fetch('https://openexchangerates.org/api/currencies.json').then(r => r.json());
  await renderExchangeRateState();

  exchangeRateWrap.classList.add('show');

  preloaderProgress.value = 1;
  setTimeout(() => showPreloader(false), 500);
});

const exchangeRateLoader = exchangeRateWrap.querySelector('.loader');

// Api
const EX_API = 'https://v6.exchangerate-api.com/v6/3823f0dc50f06c6954ddca0d/latest/';
// All rates
let rates = {};
let currencyMetadata = {};

const exchangeRateSelectCurrency = exchangeRateWrap.querySelector('select');
exchangeRateSelectCurrency.addEventListener('change', () => {
  localStorage.setItem('selected-currency', exchangeRateSelectCurrency.value);
  exchangeRateCurrencyInput.value = 1;
  renderExchangeRateState();
});

const exchangeRateCurrencyInput = exchangeRateWrap.querySelector('input.count');
exchangeRateCurrencyInput.addEventListener('input', () => {
  const count = +exchangeRateCurrencyInput.value ?? 0;

  for(const currResultBlock of exchangeRateResultCont.children) {
    const curr = currResultBlock.dataset.curr;
    const p = currResultBlock.firstElementChild;

    p.textContent = `${curr} - ${(rates[curr] * count).toFixed(3)}\n${currencyMetadata[curr] || ''}`.trim();
  }
})

const exchangeRateLastUpdateTxt = exchangeRateWrap.querySelector('p');

// Search
const exchangeRateSearchInput = exchangeRateWrap.querySelector('input.search');
exchangeRateSearchInput.addEventListener('input', () => {
  const value = exchangeRateSearchInput.value.trim().toLowerCase();
  if(!value) {
    for(const resBlock of exchangeRateResultCont.children) resBlock.style.display = 'flex';
    return;
  }

  for(const resBlock of exchangeRateResultCont.children) {
    if(resBlock.firstElementChild.textContent.toLowerCase().includes(value)) resBlock.style.display = 'flex';
    else resBlock.style.display = 'none';
  }
})

const exchangeRateResultCont = exchangeRateWrap.querySelector('div');

async function renderExchangeRateState() {
  exchangeRateSelectCurrency.textContent = '';
  exchangeRateLastUpdateTxt.textContent = 'Last update...';
  exchangeRateSearchInput.value = '';
  const currency = exchangeRateSelectCurrency.value || localStorage.getItem('selected-currency') || 'USD';

  const resp = await fetch(`${EX_API}${currency}`);
  const data = await resp.json();

  exchangeRateLastUpdateTxt.textContent = data.time_last_update_utc;

  rates = data.conversion_rates;

  const fragSelect = document.createDocumentFragment();

  for(const curr in rates) {
    const option = document.createElement('option');
    option.textContent = curr;
    fragSelect.appendChild(option);
  }
  exchangeRateSelectCurrency.appendChild(fragSelect);
  exchangeRateSelectCurrency.value = currency;

  renderExchangeRateResults();
}

function renderExchangeRateResults() {
  const favoritesCurrencies = JSON.parse(localStorage.getItem('fav-currencies') || "[]");

  exchangeRateResultCont.textContent = '';
  const fragResult = document.createDocumentFragment();

  // Render favorites
  for(const curr in rates) {
    if(!favoritesCurrencies.includes(curr)) continue;

    const div = document.createElement('div');
    const pre = document.createElement('pre');
    const imgDiv = document.createElement('div');

    div.dataset.curr = curr;
    div.append(pre, imgDiv);
    div.classList.add('curr-block');
    div.classList.add('is-fav'); // Add fov class

    pre.textContent = `${curr} - ${rates[curr].toFixed(3)}\n${currencyMetadata[curr] || ''}`.trim();
    imgDiv.className = `currency-flag currency-flag-${curr.toLowerCase()}`;
    fragResult.appendChild(div);
  }

  // Render no-favorites
  for(const curr in rates) {
    if(favoritesCurrencies.includes(curr)) continue;

    const div = document.createElement('div');
    const pre = document.createElement('pre');
    const imgDiv = document.createElement('div');

    div.dataset.curr = curr;
    div.append(pre, imgDiv);
    div.classList.add('curr-block');

    pre.textContent = `${curr} - ${rates[curr].toFixed(3)}\n${currencyMetadata[curr] || ''}`.trim();
    imgDiv.className = `currency-flag currency-flag-${curr.toLowerCase()}`;
    fragResult.appendChild(div);
  }

  exchangeRateResultCont.appendChild(fragResult);
}

// Set progress value
preloaderProgress.value = 2;