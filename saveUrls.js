// Path
let filesToRemove = [],
// Path: imgUrl
filesToUpload = {},
// Url-name: imgUrl
localImgUrls = {};

// ==========================================
const urlsWrap = document.querySelector('.save-urls-wrap');
urlsWrap.addEventListener('click', e => {
  if(!e.target.classList.contains('toggle-add-url-form') && !e.target.closest('.add-url-form')) addUrlForm.classList.remove('show');
})

const allUrlsContainer = urlsWrap.querySelector('.all-urls-container');
// Open
const openUrlWrapBtn = allDashboardItem.querySelector('.open-save-urls-wrap');
openUrlWrapBtn.addEventListener('click', async () => {
  closeAllWraps();

  if(!imgCompressLoaded || !allUrlsObj) {
    preloaderProgress.max = 1;
    preloaderProgress.value = 0;
    whatIsLoadingText.textContent = 'Start...';
    showPreloader();
  }

  // Load content
  if(!allUrlsObj) allUrlsObj = await getContent('urls') || {};
  // Load image compression
  if(!imgCompressLoaded) {
    await loadScript('https://cdn.jsdelivr.net/npm/browser-image-compression@2.0.2/dist/browser-image-compression.js');
    imgCompressLoaded = true;
  }

  if(preloaderWrap.classList.contains('show')) {
    preloaderProgress.value = 1;
    whatIsLoadingText.textContent = 'Loaded';
    setTimeout(() => showPreloader(false), 500);
  }

  renderAllUrls();
  urlsWrap.classList.add('show');
});

let allUrlsObj = null;

/* Url progress */
const urlProgress = urlsWrap.querySelector('.ulr-progress');
const urlBlocksLimitText = urlsWrap.querySelector('.url-blocks-limit');

// Render urls blocks
function createUrlElement(name, searchVal = null) {
  const origUrl = allUrlsObj[name].url;
  const url = origUrl.startsWith('http') ? origUrl : `https://${origUrl}`;
  let markRegexp = !searchVal ? null : new RegExp(hashHtmlSymbols(searchVal), 'gi');

  const div = document.createElement('div');
  div.dataset.name = name;
  div.classList.add('url-block');

  const p = document.createElement('p');
  if(!searchVal) p.textContent = allUrlsObj[name].url;
  else p.innerHTML = hashHtmlSymbols(allUrlsObj[name].url).replace(markRegexp, '<mark>$&</mark>');

  const delBtn = document.createElement('button');
  delBtn.classList.add('del-url-btn');
  delBtn.innerHTML = '<svg><use href="#delete-code"></use></svg>';

  const editBtn = document.createElement('button');
  editBtn.classList.add('open-edit-url-form-btn');
  editBtn.innerHTML = '<svg><use href="#edit"></use></svg>';

  const a = document.createElement('a');
  if(!searchVal) a.textContent = name;
  else a.innerHTML = hashHtmlSymbols(name).replace(markRegexp, '<mark>$&</mark>');
  a.href = url;
  a.setAttribute('target', '_blank');

  const img = document.createElement('img');
  img.loading = 'lazy';
  img.alt = 'Url img';
  img.src =
  localImgUrls[name]
  || allUrlsObj[name].imgUrl
  || '/all-imgs/Classic-dashboard-img.webp';

  const textsBlock = document.createElement('div');
  textsBlock.classList.add('urlAndName-block');
  textsBlock.append(p, a);

  const favBtn = document.createElement('button');
  favBtn.innerHTML = '<svg><use href="#favorite-icon"></use></svg>';
  favBtn.style.color = allUrlsObj[name].isFav ? 'orange' : 'white';
  favBtn.style.backgroundColor = allUrlsObj[name].isFav ? 'white' : 'black';
  favBtn.classList.add('fav-url-btn');

  div.append(img, delBtn, editBtn, favBtn, textsBlock);
  return div;
}

function renderAllUrls() {
  searchUrlInput.value = '';

  allUrlsContainer.textContent = '';
  const frag = document.createDocumentFragment();

  // Render favorite urls
  for(let n in allUrlsObj) if(allUrlsObj[n].isFav) frag.appendChild(createUrlElement(n));
  // Render no favorite urls
  for(let n in allUrlsObj) if(!allUrlsObj[n].isFav) frag.appendChild(createUrlElement(n));
  // Append fragment
  allUrlsContainer.appendChild(frag);

  const lng = Object.keys(allUrlsObj).length;
  urlProgress.value = lng;
  urlBlocksLimitText.textContent = `Urls: ${lng}/${allBlockLimitsObj.urls}`;
}

// Add url
const addUrlForm = urlsWrap.querySelector('.add-url-form');

const nameUrlInput = addUrlForm.querySelector('.add-url-name-input');
nameUrlInput.addEventListener('input', () => renderShowFieldsBlock(Object.keys(allUrlsObj), nameUrlInput.value.trim(), nameUrlInput, true));

const openedUrlInput = addUrlForm.querySelector('.add-opened-url-input');
openedUrlInput.addEventListener('input', () => renderShowFieldsBlock(Object.keys(allUrlsObj).map(n => allUrlsObj[n].url), openedUrlInput.value.trim(), openedUrlInput));

const imageUrlInput = addUrlForm.querySelector('.add-url-img-input');

// Toggle add url form btn
const toggleUrlFormBtn = urlsWrap.querySelector('.toggle-add-url-form');
toggleUrlFormBtn.addEventListener('click', () => {
  addUrlForm.classList.toggle('show');
  openedUrlInput.focus();
});

const addUrlBtn = addUrlForm.querySelector('.add-url-btn');
addUrlBtn.addEventListener('click', async () => {
  if(Object.keys(allUrlsObj).length >= allBlockLimitsObj.urls) return showResponseFn(`You have max urls ${allBlockLimitsObj.urls}/${allBlockLimitsObj.urls}`);

  const name = nameUrlInput.value.trim();
  if(Object.keys(allUrlsObj).find(n => n === name)) return showResponseFn('You already have a URL with this name');
  if(!name) {
    addUrlForm.classList.remove('show');
    return showResponseFn('Please enter a URL name');
  }
  if(name.length > allValuesLimit.urlTitle) return showResponseFn(`URL name must be ${allValuesLimit.urlTitle} characters or less`);

  const url = openedUrlInput.value.trim();
  if(!url) return showResponseFn('Please enter the URL');

  let userUploadImg = imageUrlInput.files[0];
  let imgUrl = '/all-imgs/Classic-dashboard-img.webp';
  let imgPath = null;

  if(userUploadImg) {
    addUrlBtn.disabled = true;
    if(userUploadImg.type !== 'image/svg+xml') userUploadImg = await imageCompression(userUploadImg, compressImgOptions);
    addUrlBtn.disabled = false;
    const filePoint = userUploadImg.name.split('.').pop();
    const pathInBucket = `${userId}/${crypto.randomUUID()}.${filePoint}`;
    imgPath = pathInBucket;

    filesToUpload[pathInBucket] = userUploadImg;

    imgUrl = client.storage
      .from('images')
      .getPublicUrl(pathInBucket)
      .data.publicUrl;

    localImgUrls[name] = URL.createObjectURL(userUploadImg);
  }

  initUndoActionBlock('urls', allUrlsObj);

  allUrlsObj[name] = {url, imgUrl, imgPath};
  renderAllUrls();
  addUrlForm.classList.remove('show');
  urlSaveBtn.classList.add('unsaved');

  nameUrlInput.value = '';
  openedUrlInput.value = '';
  imageUrlInput.value = '';
})

// Search urls
let searchUrlTimer = null;
const searchUrlInput = urlsWrap.querySelector('.search-url');
searchUrlInput.addEventListener('input', () => {
  clearTimeout(searchUrlTimer);
  searchUrlTimer = setTimeout(() => {
    allUrlsContainer.textContent = '';
    const frag = document.createDocumentFragment();

    const val = searchUrlInput.value.toLowerCase().trim();
    if(!val) return renderAllUrls();
    const safeVal = val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const filterArr = Object.keys(allUrlsObj).filter(
      n => n.toLowerCase().includes(val)
      || allUrlsObj[n].url.toLowerCase().includes(val)
    );

    // Render favorite urls
    for(let n of filterArr) if(allUrlsObj[n].isFav) frag.appendChild(createUrlElement(n, val));
    // Render no favorite urls
    for(let n of filterArr) if(!allUrlsObj[n].isFav) frag.appendChild(createUrlElement(n, val));
    // Append fragment
    allUrlsContainer.appendChild(frag);

    if(!allUrlsContainer.childElementCount) return allUrlsContainer.innerHTML = '<h1>No urls found...</h1>';
  }, 500);
})

// Edit url card
let initEditUrlName = null;

const editUrlForm = urlsWrap.querySelector('.edit-url-form');
const selectEditItem = editUrlForm.querySelector('select');

const editChangesInput = editUrlForm.querySelector('input');
editChangesInput.addEventListener('input', () => {
  if(selectEditItem.value !== 'image') renderShowFieldsBlock(
    selectEditItem.value === 'name'
    ? Object.keys(allUrlsObj)
    : Object.keys(allUrlsObj)(n => allUrlsObj[n].url),
    editChangesInput.value.trim(),
    editChangesInput,
    selectEditItem.value === 'name'
  ); else return showFieldsBlock.classList.remove('show');
})

const confirmEditUrlBtn = editUrlForm.querySelector('.confirm-edit-url-btn');

selectEditItem.addEventListener('change', () => editChangesInput.type = selectEditItem.value === 'image' ? 'file' : 'text');
confirmEditUrlBtn.addEventListener('click', async () => {
  const editItem = selectEditItem.value;
  confirmEditUrlBtn.disabled = true;
  const editChange = editItem === 'image'
    ? editChangesInput.files[0].type !== 'image/svg+xml'
    ? await imageCompression(editChangesInput.files[0], compressImgOptions)
    : editChangesInput.files[0]
    : editChangesInput.value;

  confirmEditUrlBtn.disabled = false;

  if(!editChange) return showResponseFn('Please enter your change');

  initUndoActionBlock('urls', allUrlsObj);

  if(editItem === 'name') {
    if(editChange in allUrlsObj) return showResponseFn('You already used this name');
    if(editChange.trim().length > allValuesLimit.urlTitle) return showResponseFn(`URL name must be ${allValuesLimit.urlTitle} characters or less`);

    const initObj = allUrlsObj[initEditUrlName];
    delete allUrlsObj[initEditUrlName];
    allUrlsObj[editChange] = initObj;

    renderAllUrls();
    editUrlForm.classList.remove('show');
    urlSaveBtn.classList.add('unsaved');
  }
  else if(editItem === 'url') {
    if(!editChange) return showResponseFn('Please set url');

    allUrlsObj[initEditUrlName].url = editChange;

    renderAllUrls();
    editUrlForm.classList.remove('show');
    urlSaveBtn.classList.add('unsaved');
  }
  else if(editItem === 'image') {
    const oldImgPath = allUrlsObj[initEditUrlName].imgPath;
    const filePoint = editChange.name.split('.').pop();
    const pathInBucket = `${userId}/${crypto.randomUUID()}.${filePoint}`;

    filesToUpload[pathInBucket] = editChange;
    if(oldImgPath) filesToRemove.push(oldImgPath);

    const imgUrl = client.storage.from('images')
      .getPublicUrl(pathInBucket)
      .data.publicUrl;

    allUrlsObj[initEditUrlName].imgUrl = imgUrl;
    allUrlsObj[initEditUrlName].imgPath = pathInBucket;

    localImgUrls[initEditUrlName] = URL.createObjectURL(editChange);

    renderAllUrls();
    editUrlForm.classList.remove('show');
    urlSaveBtn.classList.add('unsaved');
  }
})

// Delegation
let favoriteUrlTimer = null;
let delUrlTimer = null;
allUrlsContainer.addEventListener('click', e => {
  editUrlForm.classList.remove('show');
  if(e.target.closest('.del-url-btn')) { // Delete url
    if(localStorage.getItem('conf-before-delete') === 'true' && !confirm('Delete?')) return;

    const targetBtn = e.target.closest('.del-url-btn');
    const targetUrlBlock = targetBtn.parentElement;
    const delUrlName = targetUrlBlock.querySelector('a').textContent;

    const initImgPath = allUrlsObj[delUrlName].imgPath;
    if(initImgPath) filesToRemove.push(initImgPath);

    initUndoActionBlock('urls', allUrlsObj);

    delete allUrlsObj[delUrlName];

    urlSaveBtn.classList.add('unsaved');

    if(localStorage.getItem('disabled-anim') === 'true') return renderAllUrls();

    targetUrlBlock.classList.add('del-anim');
    clearTimeout(delUrlTimer);
    delUrlTimer = setTimeout(renderAllUrls, delAnimTime);
  }
  else if(e.target.closest('.open-edit-url-form-btn')) { // Open url edit
    editUrlForm.classList.add('show');

    const targetBtn = e.target.closest('.open-edit-url-form-btn');
    const initUrlCard = targetBtn.parentElement;

    initEditUrlName = initUrlCard.querySelector('a').textContent;

    const targetBtnObj = targetBtn.getBoundingClientRect();
    const editUrlFormObj = editUrlForm.getBoundingClientRect();

    editUrlForm.style.left = `${Math.max(0, targetBtnObj.left - editUrlFormObj.width)}px`;
    editUrlForm.style.top = `${targetBtnObj.top + urlsWrap.scrollTop - 130}px`;
  }
  else if(e.target.closest('.fav-url-btn')) { // Favorite url btn
    const urlName = e.target.closest('.url-block').dataset.name;

    allUrlsObj[urlName].isFav = !allUrlsObj[urlName].isFav;

    clearTimeout(favoriteUrlTimer);
    favoriteUrlTimer = setTimeout(renderAllUrls, 500);

    urlSaveBtn.classList.add('unsaved');
  }
})