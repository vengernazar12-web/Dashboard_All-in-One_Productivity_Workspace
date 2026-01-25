const urlsWrap = document.querySelector('.save-urls-wrap');
// Open urls wrap
document.querySelector('.open-save-urls-wrap')
.addEventListener('click', () => {
  showPreloader();
  renderAllUrls();
  urlsWrap.classList.add('show');
  showPreloader(false);

  const urlsBlocksLng = Object.keys(allUrlsObj).length;
  urlProgress.value = urlsBlocksLng;
  urlBlocksLimitText.textContent = `Urls: ${urlsBlocksLng}/50`;
});
// Close urls wrap
urlsWrap.querySelector('.close-add-urls-wrap')
.addEventListener('click', () => urlsWrap.classList.remove('show'))

let allUrlsObj = {};

/* Url progress */
const urlProgress = urlsWrap.querySelector('.ulr-progress');
const urlBlocksLimitText = urlsWrap.querySelector('.url-blocks-limit');

// Render urls blocks
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
  if(!arr.length) {
    urlProgress.value = 0;
    urlBlocksLimitText.textContent = 'Urls: 0/50';
    return allUrlsContainer.innerHTML = '<h1>Немає URLs...</h1>';
  }
  allUrlsContainer.textContent = '';

  for(let u of arr) createUrlElement(u, allUrlsObj[u]);

  const urlsBlocksLng = Object.keys(allUrlsObj).length;
  urlProgress.value = urlsBlocksLng;
  urlBlocksLimitText.textContent = `Urls: ${urlsBlocksLng}/50`;
}

const nameUrlInput = urlsWrap.querySelector('.add-url-name-input');
const openedUrlInput = urlsWrap.querySelector('.add-opened-url-input');

const addUrlBtn = urlsWrap.querySelector('.add-url-btn');
addUrlBtn.addEventListener('click', () => {
  if(Object.keys(allUrlsObj).length >= 50) return showResponseFn('Your have urls limit');

  const value = nameUrlInput.value.trim();
  const opValue = openedUrlInput.value.trim();
  if(!value.length || !opValue.length) return;
  if(allUrlsObj[value]) return showResponseFn(`Url name "${value}" is already used`);

  allUrlsObj[value] = opValue;

  nameUrlInput.value = '';
  openedUrlInput.value = '';
  urlSaveBtn.classList.add('unsaved');

  renderAllUrls();
})

const allUrlsContainer = urlsWrap.querySelector('.all-urls-container');
allUrlsContainer.addEventListener('click', e => {
  if(e.target.classList.contains('del-url-btn')) {
    if(localStorage.getItem('conf-before-delete') === 'true' && !confirm('Delete?')) return;

    delete allUrlsObj[e.target.parentElement.lastElementChild.textContent];

    if(localStorage.getItem('disabled-anim') === 'true') return renderAllUrls();

    e.target.parentElement.classList.add('del-anim');
    console.log()

    setTimeout(renderAllUrls, delAnimTime);
    urlSaveBtn.classList.add('unsaved');
  }
})

// Search urls
urlsWrap.querySelector('.search-url')
.addEventListener('input', e => {
  const value = e.target.value;
  if(!value.length) return renderAllUrls();
  renderFilteredUrls(value);
})
function renderFilteredUrls(text) {
  allUrlsContainer.textContent = '';
  text = text.toLowerCase();

  for(let name of Object.keys(allUrlsObj)) {
    if(name.toLowerCase().includes(text) || allUrlsObj[name].toLowerCase().includes(text))
      createUrlElement(name, allUrlsObj[name]);
  };

  if(!allUrlsContainer.children.length) allUrlsContainer.innerHTML = '<h1>Нічого не знайдено...</h1>'
}