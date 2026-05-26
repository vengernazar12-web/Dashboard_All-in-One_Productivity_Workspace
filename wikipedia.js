const WIKIPEDIA_API = 'https://en.wikipedia.org/w/rest.php/v1/search/page?';
const WIKIPEDIA_HTML_API = 'https://en.wikipedia.org/api/rest_v1/page/html/';

const wikipediaWrap = document.querySelector('.wikipedia-wrap');
wikipediaWrap.addEventListener('click', e => {
  const target = e.target;
  if(!target.closest('.origin-wikipedia-html')) {
    originWikipediaHtmlCont.classList.remove('open');
    originWikipediaHtmlCont.textContent = '';
  };
  if(!target.closest('.show-auto-complete')) wikipediaShowAutoCompleteCont.style.display = 'none';
})
// Open
const openWikipediaBtn = allDashboardItem.querySelector('.open-wikipedia-wrap');
openWikipediaBtn.addEventListener('click', () => {
  closeAllWraps();
  wikipediaWrap.classList.add('show');
})

const wikipediaSearchLoader = wikipediaWrap.querySelector('.loader');

const wikipediaShowAutoCompleteCont = wikipediaWrap.querySelector('.show-auto-complete');
wikipediaShowAutoCompleteCont.addEventListener('click', e => {
  const target = e.target;
  const closestAutoCompBlock = target.closest('[data-title]');
  if(closestAutoCompBlock) {
    clearTimeout(wikiShowAutoCompTimeout);

    searchWikipediaValueInput.value = closestAutoCompBlock.dataset.title;
    wikipediaShowAutoCompleteCont.style.display = 'none';
  }
})

const originWikipediaHtmlCont = wikipediaWrap.querySelector('.origin-wikipedia-html');

const searchWikipediaResultsCont = wikipediaWrap.querySelector('.search-results');
searchWikipediaResultsCont.addEventListener('click', async e => {
  const target = e.target;
  const searchResBlock = target.closest('.search-result-block');
  if(searchResBlock) {
    const title = searchResBlock.dataset.title;

    wikipediaSearchLoader.style.display = 'block';

    try {
      const res = await fetch(`${WIKIPEDIA_HTML_API}${encodeURIComponent(title)}`);
      const wikiHtml = await res.text();

      originWikipediaHtmlCont.innerHTML = wikiHtml;
      originWikipediaHtmlCont.classList.add('open');
      wikipediaSearchLoader.style.display = 'none';
    } catch(e) {
      showResponseFn(`Error: ${e}`);
      wikipediaSearchLoader.style.display = 'none';
    }
  }
})

let wikiShowAutoCompTimeout = null;
const searchWikipediaValueInput = wikipediaWrap.querySelector('.search-value');
searchWikipediaValueInput.addEventListener('input', () => {
  const val = searchWikipediaValueInput.value.trim();
  if(!val) return wikipediaShowAutoCompleteCont.style.display = 'none';

  clearTimeout(wikiShowAutoCompTimeout);
  wikiShowAutoCompTimeout = setTimeout(async () => {
    const autoCompResp = await fetch(`https://en.wikipedia.org/w/rest.php/v1/search/title?q=${val}&limit=10`);
    const autoCompData = await autoCompResp.json();

    const pages = autoCompData.pages;
    if(!pages.length) return wikipediaShowAutoCompleteCont.style.display = 'none';

    wikipediaShowAutoCompleteCont.innerHTML = pages.map(p => `
<div data-title='${p.title}'>
  <h3><strong>${p.title}</strong></h3>
  <p>${p.description || '...'}</p>
</div>
`.trim()).join('');

  if(wikipediaShowAutoCompleteCont.style.display === 'none') {
    wikipediaShowAutoCompleteCont.style.display = 'block';
    wikipediaShowAutoCompleteCont.style.height = '0px';
    void wikipediaShowAutoCompleteCont.offsetWidth;
  }
  wikipediaShowAutoCompleteCont.style.height = `${wikipediaShowAutoCompleteCont.scrollHeight}px`;
  }, 500);
})

const searchWikipediaLimitInput = wikipediaWrap.querySelector('.search-limit');

const searchWikipediaBtn = wikipediaWrap.querySelector('.search-btn');
searchWikipediaBtn.addEventListener('click', async () => {
  const searchVal = searchWikipediaValueInput.value.trim();
  let searchLimit = +searchWikipediaLimitInput.value.trim() || 10;
  if(searchLimit > 100) searchLimit = 100;
  else if(searchLimit < 1) searchLimit = 1;

  if(!searchVal) return showResponseFn('Please enter the search value');

  searchWikipediaValueInput.value = '';
  searchWikipediaResultsCont.textContent = '';

  wikipediaSearchLoader.style.display = 'block';
  searchWikipediaBtn.disabled = true;

  try {
    const resp = await fetch(`${WIKIPEDIA_API}q=${encodeURIComponent(searchVal)}&limit=${searchLimit}`, {
      headers: { "Api-User-Agent": "Dashboard, service: wikipedia" }
    });

    const data = await resp.json();

    const frag = document.createDocumentFragment();
    for(let result of data.pages ?? []) {
      const div = document.createElement('div'), h4 = document.createElement('h4'),
      pre = document.createElement('pre'), p = document.createElement('p');

      const imgUrl = result.thumbnail?.url;
      const img = imgUrl ? document.createElement('img') : '';

      div.classList.add('search-result-block');
      div.dataset.title = result.title;
      div.append(h4, pre, p);
      if(img) {
        div.appendChild(img);
        img.src = imgUrl;
        img.alt = 'Wikipedia image';
      };

      h4.textContent = result.title;
      const textArr = result.excerpt.split('.');
      pre.innerHTML = `${textArr.length > 1 ? textArr.slice(0, -1).join('.') : textArr.join('.')}.`;
      p.textContent = `Description: ${result.description}`;

      frag.appendChild(div);
    }

    searchWikipediaResultsCont.appendChild(frag);

    wikipediaSearchLoader.style.display = 'none';
    searchWikipediaBtn.disabled = false;
  } catch(e) {
    showResponseFn(`Error: ${e}`);
    wikipediaSearchLoader.style.display = 'none';
    searchWikipediaBtn.disabled = false;
  };
})