const saveUrlsWrap = document.querySelector('.save-urls-wrap');
document.querySelector('.open-save-urls-wrap')
.addEventListener('click', () => {
  showPreloader();
  renderAllUrls();
  saveUrlsWrap.classList.add('show');
  showPreloader(false);

  const urlsBlocksLng = Object.keys(allUrlsObj).length;
  urlProgress.value = urlsBlocksLng;
  urlBlocksLimitText.textContent = `Urls: ${urlsBlocksLng}/50`;
});
saveUrlsWrap.querySelector('.close-add-urls-wrap')
.addEventListener('click', () => saveUrlsWrap.classList.remove('show'))

let allUrlsObj = null;

function createUrlElement(name, opened) {
  const div = document.createElement('div');
  div.classList.add('url-block');

  const p = document.createElement('p');
  p.textContent = opened;

  const btn = document.createElement('button');
  btn.classList.add('del-url-btn');

  const a = document.createElement('a');
  a.textContent = name;
  a.setAttribute('href', opened);
  a.setAttribute('target', '_blank');

  div.append(p, btn, a);

  allUrlsContainer.appendChild(div);
}

function renderAllUrls() {
  const arr = Object.keys(allUrlsObj);
  if(!arr.length) return allUrlsContainer.innerHTML = '<h1>Немає URLs...</h1>'
  allUrlsContainer.textContent = '';

  for(let u of arr) createUrlElement(u, allUrlsObj[u]);
}

const allUrlsContainer = saveUrlsWrap.querySelector('.all-urls-container');
allUrlsContainer.addEventListener('click', e => {
  if(e.target.classList.contains('del-url-btn')) {
    if(localStorage.getItem('conf-before-delete') === 'true') if(!confirm('Delete?')) return;

    delete allUrlsObj[e.target.parentElement.lastElementChild.textContent];

    if(localStorage.getItem('disabled-anim') === 'true') return renderAllUrls();

    e.target.parentElement.classList.add('del-anim');

    setTimeout(renderAllUrls(), delAnimTime);
    urlSaveBtn.classList.add('unsaved');

    const urlsBlocksLng = Object.keys(allUrlsObj).length;
    urlProgress.value = urlsBlocksLng;
    urlBlocksLimitText.textContent = `Urls: ${urlsBlocksLng}/50`;
  }
})

const nameUrlInput = saveUrlsWrap.querySelector('.add-url-name-input');
const openedUrlInput = saveUrlsWrap.querySelector('.add-opened-url-input');
const addUrlBtn = saveUrlsWrap.querySelector('.add-url-btn');

addUrlBtn.addEventListener('click', () => {
  const urlsBlocksLng = Object.keys(allUrlsObj).length;
  if(urlsBlocksLng >= 50) return showResponseFn('Your have urls limit');

  const value = nameUrlInput.value.trim();
  const opValue = openedUrlInput.value.trim();
  if(!value.length || !opValue.length) return;
  if(allUrlsObj[value]) return showResponseFn(`Url name "${value}" is already used`);

  allUrlsObj[value] = opValue;

  nameUrlInput.value = '';
  openedUrlInput.value = '';
  urlSaveBtn.classList.add('unsaved');

  renderAllUrls();

  urlProgress.value = urlsBlocksLng + 1;
  urlBlocksLimitText.textContent = `Urls: ${urlsBlocksLng + 1}/50`;
})

saveUrlsWrap.querySelector('.search-url')
.addEventListener('input', e => {
  const value = e.target.value;
  if(!value.length) return renderAllUrls();
  renderFilteredUrls(value);
})
function renderFilteredUrls(text) {
  allUrlsContainer.textContent = '';
  text = text.toLowerCase();

  for(let name of Object.keys(allUrlsObj)) {
    if(name.toLowerCase().includes(text)) createUrlElement(name, allUrlsObj[name]);
  };

  if(!allUrlsContainer.children.length) allUrlsContainer.innerHTML = '<h1>Нічого не знайдено...</h1>'
}

/* Progress and urls-blocks limit text */
const urlProgress = saveUrlsWrap.querySelector('.ulr-progress');
const urlBlocksLimitText = saveUrlsWrap.querySelector('.url-blocks-limit');