// Set preloader text
whatIsLoadingText.textContent = 'Loading URL handling...';

// Path
let filesToRemove = [],
// Path: imgUrl
filesToUpload = {},
// Url-name: imgUrl
localImgUrls = {};

const compressImgOptions = {
  maxSizeMB: 0.35,
  maxWidthOrHeight: 475,
  fileType: 'image/webp',
  initialQuality: 0.8,
  useWebWorker: true
};
// ==========================================
const urlsWrap = document.querySelector('.save-urls-wrap');
const allUrlsContainer = urlsWrap.querySelector('.all-urls-container');
// Open
const openUrlWrapBtn = allDashboardItem.querySelector('.open-save-urls-wrap');
openUrlWrapBtn.addEventListener('click', () => {
  closeAllWraps();
  showPreloader();
  renderAllUrls();
  urlsWrap.classList.add('show');
  showPreloader(false);
});

let allUrlsArr = [];

/* Url progress */
const urlProgress = urlsWrap.querySelector('.ulr-progress');
const urlBlocksLimitText = urlsWrap.querySelector('.url-blocks-limit');

// Render urls blocks
function createUrlElement(name, url, imgUrl, searchVal, isFavorite) {
  url = url.startsWith('http') ? url : `https://${url}`;
  let markRegexp = new RegExp(searchVal, 'gi');

  const div = document.createElement('div');
  div.dataset.name = name;
  div.classList.add('url-block');

  const p = document.createElement('p');
  if(!searchVal) p.textContent = url;
  else p.innerHTML = url.replace(markRegexp, '<mark>$&</mark>');

  const delBtn = document.createElement('button');
  delBtn.classList.add('del-url-btn');
  delBtn.setAttribute('title', 'Delete url');
  delBtn.innerHTML = '<svg><use href="#delete-code"></use></svg>';

  const editBtn = document.createElement('button');
  editBtn.classList.add('open-edit-url-form-btn');
  editBtn.setAttribute('title', 'Edit');
  editBtn.innerHTML = '<svg><use href="#edit"></use></svg>';

  const a = document.createElement('a');
  if(!searchVal) a.textContent = name;
  else a.innerHTML = name.replace(markRegexp, '<mark>$&</mark>');
  a.href = url;
  a.setAttribute('target', '_blank');

  const img = document.createElement('img');
  img.loading = 'lazy';
  img.alt = 'Url img';
  img.src = imgUrl;

  const textsBlock = document.createElement('div');
  textsBlock.classList.add('urlAndName-block');
  textsBlock.append(p, a);

  const favBtn = document.createElement('button');
  favBtn.innerHTML = '<svg><use href="#favorite-icon"></use></svg>';
  favBtn.style.color = isFavorite ? 'orange' : 'white';
  favBtn.style.backgroundColor = isFavorite ? 'white' : 'black';
  favBtn.classList.add('fav-url-btn');

  div.append(img, delBtn, editBtn, favBtn, textsBlock);

  return div;
}

function renderAllUrls() {
  searchUrlInput.value = '';

  allUrlsContainer.textContent = '';
  const frag = document.createDocumentFragment();

  // Render favorite urls
  for(let obj of allUrlsArr) if(obj.isFav) frag.appendChild(createUrlElement(obj.title, obj.url, localImgUrls[obj.title] || obj.imgUrl, null, true));
  // Render no favorite urls
  for(let obj of allUrlsArr) if(!obj.isFav) frag.appendChild(createUrlElement(obj.title, obj.url, localImgUrls[obj.title] || obj.imgUrl, null, false));
  // Append fragment
  allUrlsContainer.appendChild(frag);

  urlProgress.value = allUrlsArr.length;
  urlBlocksLimitText.textContent = `Urls: ${allUrlsArr.length}/${allBlockLimitsObj.urls}`;
}

// Add url
const addUrlForm = urlsWrap.querySelector('.add-url-form');

const nameUrlInput = addUrlForm.querySelector('.add-url-name-input');
nameUrlInput.addEventListener('input', () => renderShowFieldsBlock(allUrlsArr.map(o => o.title), nameUrlInput.value.trim(), nameUrlInput, true));

const openedUrlInput = addUrlForm.querySelector('.add-opened-url-input');
openedUrlInput.addEventListener('input', () => renderShowFieldsBlock(allUrlsArr.map(o => o.url), openedUrlInput.value.trim(), openedUrlInput));

const imageUrlInput = addUrlForm.querySelector('.add-url-img-input');

// Toggle add url form btn
const toggleUrlFormBtn = urlsWrap.querySelector('.toggle-add-url-form');
toggleUrlFormBtn.addEventListener('click', () => {
  addUrlForm.classList.toggle('show');
  openedUrlInput.focus();
});

const addUrlBtn = addUrlForm.querySelector('.add-url-btn');
addUrlBtn.addEventListener('click', async () => {
  if(allUrlsArr.length >= allBlockLimitsObj.urls) return showResponseFn(`You have max urls ${allBlockLimitsObj.urls}/${allBlockLimitsObj.urls}`);

  const title = nameUrlInput.value.trim();
  if(allUrlsArr.find(obj => obj.title === title)) return showResponseFn('You already have a URL with this name');
  if(!title) {
    addUrlForm.classList.remove('show');
    return showResponseFn('Please enter a URL name');
  }
  if(title.length > allValuesLimit.urlTitle) return showResponseFn(`URL name must be ${allValuesLimit.urlTitle} characters or less`);

  const url = openedUrlInput.value.trim();
  if(!url) return showResponseFn('Please enter the URL');

  let userUploadImg = imageUrlInput.files[0];
  let imgUrl = '/all-imgs/Classic-dashboard-img.webp';
  let imgPath = null;

  if(userUploadImg) {
    if(userUploadImg.type !== 'image/svg+xml') userUploadImg = await imageCompression(userUploadImg, compressImgOptions);
    const filePoint = userUploadImg.name.split('.').pop();
    const {data, error: sessionE} = await client.auth.getSession();
    if(sessionE) return showResponseFn('Error! Please try again later...');
    const id = data.session.user.id;
    const pathInBucket = `${id}/${crypto.randomUUID()}.${filePoint}`;
    imgPath = pathInBucket;

    filesToUpload[pathInBucket] = userUploadImg;

    imgUrl = client.storage
      .from('images')
      .getPublicUrl(pathInBucket)
      .data.publicUrl;

    localImgUrls[title] = URL.createObjectURL(userUploadImg);
  }

  initUndoActionBlock('urls', allUrlsArr);

  allUrlsArr.push({title, url, imgUrl, imgPath});
  renderAllUrls();
  addUrlForm.classList.remove('show');
  urlSaveBtn.classList.add('unsaved');

  nameUrlInput.value = '';
  openedUrlInput.value = '';
  imageUrlInput.value = '';
  setOpenBtnsTexts();

  // Save change for userActions
  writeToUserActions(`Додано урл блок з назвою ${title} та з посиланням ${url}`);
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

    const filterArr = allUrlsArr.filter(
      obj => obj.title.toLowerCase().includes(val)
      || obj.url.toLowerCase().includes(val)
    );

    // Render favorite urls
    for(let urlObj of filterArr) if(urlObj.isFav) frag.appendChild(createUrlElement(urlObj.title, urlObj.url, urlObj.imgUrl, safeVal, true));
    // Render no favorite urls
    for(let urlObj of filterArr) if(!urlObj.isFav) frag.appendChild(createUrlElement(urlObj.title, urlObj.url, urlObj.imgUrl, safeVal, false));
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
    ? allUrlsArr.map(o => o.title)
    : allUrlsArr.map(o => o.url),
    editChangesInput.value.trim(),
    editChangesInput,
    selectEditItem.value === 'name'
  ); else return showFieldsBlock.classList.remove('show');
})

const confirmEditUrlBtn = editUrlForm.querySelector('.confirm-edit-url-btn');

selectEditItem.addEventListener('change', () => editChangesInput.type = selectEditItem.value === 'image' ? 'file' : 'text');
confirmEditUrlBtn.addEventListener('click', async () => {
  const editItem = selectEditItem.value;
  const editChange = editItem === 'image'
    ? editChangesInput.files[0].type !== 'image/svg+xml'
    ? await imageCompression(editChangesInput.files[0], compressImgOptions)
    : editChangesInput.files[0]
    : editChangesInput.value;

  if(!editChange) return showResponseFn('Please enter your change');

  initUndoActionBlock('urls', allUrlsArr);

  if(editItem === 'name') {
    if(allUrlsArr.find(o => o.title === editChange)) return showResponseFn('You already used this name');
    if(editChange.trim().length > 50) return showResponseFn('URL name must be 50 characters or less');

    for(let i = 0; i < allUrlsArr.length; i++) {
      if(allUrlsArr[i].title === initEditUrlName) {
        allUrlsArr[i].title = editChange;
        break;
      }
    }

    renderAllUrls();
    editUrlForm.classList.remove('show');
    urlSaveBtn.classList.add('unsaved');
  }
  else if(editItem === 'url') {
    if(!editChange) return showResponseFn()
    for(let i = 0; i < allUrlsArr.length; i++) {
      if(allUrlsArr[i].title === initEditUrlName) {
        allUrlsArr[i].url = editChange;
        break;
      }
    }

    renderAllUrls();
    editUrlForm.classList.remove('show');
    urlSaveBtn.classList.add('unsaved');
  }
  else if(editItem === 'image') {
    const initObj = allUrlsArr.find(obj => obj.title === initEditUrlName);
    const oldImgPath = initObj.imgPath;

    const { data, error } = await client.auth.getSession();
    if(error) return showResponseFn('Something went wrong! Please try again later');
    const id = data.session.user.id;
    const filePoint = editChange.name.split('.').pop();
    const pathInBucket = `${id}/${crypto.randomUUID()}.${filePoint}`;

    filesToUpload[pathInBucket] = editChange;
    if(oldImgPath) filesToRemove.push(oldImgPath);

    const imgUrl = client.storage.from('images')
      .getPublicUrl(pathInBucket)
      .data.publicUrl;

    initObj.imgUrl = imgUrl;
    initObj.imgPath = pathInBucket;

    localImgUrls[initObj.title] = URL.createObjectURL(editChange);

    renderAllUrls();
    editUrlForm.classList.remove('show');
    urlSaveBtn.classList.add('unsaved');
  }

  // Save change for userActions
  writeToUserActions(
    editItem === 'name'
    ? `Змінено назву урл-блоку з ${initEditUrlName} на ${editChange}`
    : editItem === 'url' ? `Змінено посилання в урл-блоку з назвою ${initEditUrlName}`
    : `Змінено картинку в урлі з назвою ${initEditUrlName}`
  );
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

    const initImgPath = allUrlsArr.find(obj => obj.title === delUrlName).imgPath;
    if(initImgPath) filesToRemove.push(initImgPath);

    initUndoActionBlock('urls', allUrlsArr);

    allUrlsArr = allUrlsArr.filter(obj => obj.title !== delUrlName);

    urlSaveBtn.classList.add('unsaved');

    setOpenBtnsTexts();

    if(localStorage.getItem('disabled-anim') === 'true') return renderAllUrls();

    targetUrlBlock.classList.add('del-anim');
    clearTimeout(delUrlTimer);
    delUrlTimer = setTimeout(renderAllUrls, delAnimTime);

    // Save change for userActions
  writeToUserActions(`Видалено урл-блок з назвою ${delUrlName}`);
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
    const urlName = e.target.closest('.fav-url-btn').parentElement.querySelector('a').textContent;
    const findUrlObj = allUrlsArr.find(obj => obj.title === urlName);

    findUrlObj.isFav = !findUrlObj.isFav;

    clearTimeout(favoriteUrlTimer);
    favoriteUrlTimer = setTimeout(renderAllUrls, 1000);

    urlSaveBtn.classList.add('unsaved');

    // Save change for userActions
  writeToUserActions(findUrlObj.isFav ? `Позначено урл-блок з назвою ${urlName} як фаворіт` : `Забрано урл-блок з назвою ${urlName} з фаворитів`);
  }
})

// Set preloader value
preloaderProgress.value = 4;