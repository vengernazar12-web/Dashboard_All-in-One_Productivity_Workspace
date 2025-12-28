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
  if(!allUrlsArr.length) return allUrlsContainer.innerHTML = '<h1>Немає URLs...</h1>'
  allUrlsContainer.textContent = '';

  allUrlsArr.forEach(u => createUrlElement(u, allUrlsObj[u]));

  Object.keys(allUrlsObj);
}

const saveUrlsWrap = document.querySelector('.save-urls-wrap');

const allUrlsContainer = document.querySelector('.all-urls-container');
allUrlsContainer.addEventListener('click', e => {
  if(e.target.classList.contains('del-url-btn')) {
    delete allUrlsObj[e.target.parentElement.lastElementChild.textContent];
    allUrlsArr = Object.keys(allUrlsObj);

    e.target.parentElement.classList.add('del-anim');

    setTimeout(() => {
      renderAllUrls();
    }, 1000);
  }
})

const nameUrlInput = document.querySelector('.save-url-name-input');
const openedUrlInput = document.querySelector('.save-opened-url-input');
const saveUrlBtn = document.querySelector('.save-url-btn');

saveUrlBtn.addEventListener('click', () => {
  const value = nameUrlInput.value.trim();
  const opValue = openedUrlInput.value.trim();
  if(!value.length || !opValue.length) return;
  if(allUrlsObj[value]) return alert('У вас уже є така назва!');

  allUrlsObj[value] = opValue;
  allUrlsArr = Object.keys(allUrlsObj);

  nameUrlInput.value = '';
  openedUrlInput.value = '';

  renderAllUrls();
})

let allUrlsObj = null;
let allUrlsArr = null;

document.querySelector('.search-url')
.addEventListener('input', e => {
  const value = e.target.value;
  if(!value.length) return renderAllUrls();
  renderFilteredUrls(value);
})
function renderFilteredUrls(text) {
  allUrlsContainer.textContent = '';
  text = text.toLowerCase();

  allUrlsArr.forEach(name => {if(name.toLowerCase().includes(text)) createUrlElement(name, allUrlsObj[name])});

  if(!allUrlsContainer.children.length) allUrlsContainer.innerHTML = '<h1>Нічого не знайдено...</h1>'
}