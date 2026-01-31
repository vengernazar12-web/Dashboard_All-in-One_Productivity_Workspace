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
// Open urls wrap
document.querySelector('.open-save-urls-wrap')
.addEventListener('click', () => {
  showPreloader();
  renderAllUrls();
  urlsWrap.classList.add('show');
  showPreloader(false);
});
// Close urls wrap
urlsWrap.querySelector('.close-add-urls-wrap')
.addEventListener('click', () => urlsWrap.classList.remove('show'))

let allUrlsArr = [];

/* Url progress */
const urlProgress = urlsWrap.querySelector('.ulr-progress');
const urlBlocksLimitText = urlsWrap.querySelector('.url-blocks-limit');

// Render urls blocks
function createUrlElement(name, url, imgUrl, searchVal = null) {
  let markRegexp = new RegExp(searchVal, 'gi');

  const div = document.createElement('div');
  div.classList.add('url-block');

  const p = document.createElement('p');
  if(!searchVal) p.textContent = url;
  else p.innerHTML = url.replace(markRegexp, '<mark>$&</mark>');

  const delBtn = document.createElement('button');
  delBtn.classList.add('del-url-btn');
  delBtn.setAttribute('title', 'Delete url');
  delBtn.innerHTML = '<svg><use href="sprite.svg#delete-code"></use></svg>';

  const editBtn = document.createElement('button');
  editBtn.classList.add('open-edit-url-form-btn');
  editBtn.setAttribute('title', 'Edit');
  editBtn.innerHTML = '<svg><use href="sprite.svg#edit"></use></svg>';

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

  div.append(img, delBtn, editBtn, textsBlock);
  allUrlsContainer.appendChild(div);
}
function renderAllUrls() {
  searchUrlInput.value = '';

  if(!allUrlsArr.length) {
    urlProgress.value = 0;
    urlBlocksLimitText.textContent = 'Urls: 0/25';
    return allUrlsContainer.innerHTML = '<h1>URLs...</h1>';
  }
  allUrlsContainer.textContent = '';

  for(let obj of allUrlsArr) createUrlElement(obj.title, obj.url, localImgUrls[obj.title] || obj.imgUrl);

  urlProgress.value = allUrlsArr.length;
  urlBlocksLimitText.textContent = `Urls: ${allUrlsArr.length}/25`;

  showUnsavedImgs();
}

// Add url
const addUrlForm = urlsWrap.querySelector('.add-url-form');
const nameUrlInput = addUrlForm.querySelector('.add-url-name-input');
const openedUrlInput = addUrlForm.querySelector('.add-opened-url-input');
const imageUrlInput = addUrlForm.querySelector('.add-url-img-input');
// Toggle add url form btn
const toggleUrlFormBtn = urlsWrap.querySelector('.toggle-add-url-form');
toggleUrlFormBtn.addEventListener('click', () => {
  addUrlForm.classList.toggle('show');
  openedUrlInput.focus();
});

const addUrlBtn = addUrlForm.querySelector('.add-url-btn');
addUrlBtn.addEventListener('click', async () => {
  const title = nameUrlInput.value.trim();
  if(allUrlsArr.find(obj => obj.title === title)) return showResponseFn('You already have a URL with this name');
  if(!title) return showResponseFn('Please enter a URL name');
  if(title.length > 50) return showResponseFn('URL name must be 50 characters or less');

  const url = openedUrlInput.value.trim();
  if(!url) return showResponseFn('Please enter the URL');

  let userUploadImg = imageUrlInput.files[0];
  let imgUrl = '/Classic-dashboard-img.webp';
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

  allUrlsArr.push({title, url, imgUrl, imgPath});
  renderAllUrls();
  addUrlForm.classList.remove('show');
  urlSaveBtn.classList.add('unsaved');
  isUrlsUnsaved = true;

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
    const val = searchUrlInput.value.toLowerCase();
    if(!val) return renderAllUrls();

    const filterArr = allUrlsArr.filter(
      obj => obj.title.toLowerCase().includes(val)
      || obj.url.toLowerCase().includes(val)
    )
    for(let urlObj of filterArr) createUrlElement(urlObj.title, urlObj.url, urlObj.imgUrl, val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

    clearTimeout(searchUrlTimer);

    if(!allUrlsContainer.childElementCount) return allUrlsContainer.innerHTML = '<h1>...</h1>';
  }, 500);
})

// Show unsaved imgs
function showUnsavedImgs() {
  for(let block of allUrlsContainer.children) {
    const title = block.querySelector('a').textContent;
    const imgPath = allUrlsArr.find(obj => obj.title === title)?.imgPath;
    if(filesToUpload[imgPath] || localImgUrls[title]) block.classList.add('unsaved');
  }
}

// Edit url card
let initEditUrlName = null;

const editUrlForm = urlsWrap.querySelector('.edit-url-form');
const selectEditItem = editUrlForm.querySelector('select');
const editChangesInput = editUrlForm.querySelector('input');
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

  if(editItem === 'name') {
    if(allUrlsArr[editChange]) return showResponseFn('You already used this name');
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
  isUrlsUnsaved = true;
})

// Delegation
allUrlsContainer.addEventListener('click', e => {
  editUrlForm.classList.remove('show');
  if(e.target.closest('.del-url-btn')) {
    if(localStorage.getItem('conf-before-delete') === 'true' && !confirm('Delete?')) return;

    const targetBtn = e.target.closest('.del-url-btn');
    const targetUrlBlock = targetBtn.parentElement;
    const delUrlName = targetUrlBlock.querySelector('a').textContent;

    const initImgPath = allUrlsArr.find(obj => obj.title === delUrlName).imgPath;
    if(initImgPath) filesToRemove.push(initImgPath);

    allUrlsArr = allUrlsArr.filter(obj => obj.title !== delUrlName);

    urlSaveBtn.classList.add('unsaved');
    isUrlsUnsaved = true;
    if(localStorage.getItem('disabled-anim') === 'true') return renderAllUrls();

    targetUrlBlock.classList.add('del-anim');

    setTimeout(renderAllUrls, delAnimTime);
  }
  else if(e.target.closest('.open-edit-url-form-btn')) {
    editUrlForm.classList.add('show');

    const targetBtn = e.target.closest('.open-edit-url-form-btn');
    const initUrlCard = targetBtn.parentElement;

    initEditUrlName = initUrlCard.querySelector('a').textContent;

    const targetBtnObj = targetBtn.getBoundingClientRect();
    const editUrlFormObj = editUrlForm.getBoundingClientRect();

    editUrlForm.style.left = `${Math.max(0, targetBtnObj.left - editUrlFormObj.width)}px`;
    editUrlForm.style.top = `${targetBtnObj.top + urlsWrap.scrollTop}px`;
  }
})

// Set preloader value
preloaderProgress.value = 4;