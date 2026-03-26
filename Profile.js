// Set preloader text
whatIsLoadingText.textContent = 'Loading profile logic...';

// All profiles imgs arr
let allAvatarsArr = null;

let isLoadingAvatar = false;
// Delegation
function initSettingsForOpen() {
  if(localStorage.getItem('del-anim-time') !== null) {
    const val = +localStorage.getItem('del-anim-time') / 1000;
    animationTimeSelect.value = `${val}s`;
  };
  if(localStorage.getItem('disabled-anim') === 'true') disAnimBtn.textContent = '✔️';
  else disAnimBtn.textContent = '✖️';
  if(localStorage.getItem('conf-before-delete') === 'true') confBefDelBtn.textContent = '✔️';
  else confBefDelBtn.textContent = '✖️';
  noteFontSizeSettInput.value = localStorage.getItem('notes-font-size') || 1.2;

  selectMicLang.value = localStorage.getItem('mic-lang') || 'en-US';

  settingsWindow.classList.add('show');
}
const profileWrap = document.querySelector('.user-profile-wrap');
profileWrap.addEventListener('click', async e => {
  const target = e.target;
  // Open avatar selection
  if(target.classList.contains('profile-img-preview')) {
    if(allAvatarsBlock.childElementCount) return allAvatarsBlock.classList.add('show');

    allAvatarsBlock.textContent = '';

    const frag = document.createDocumentFragment();
    for(let obj of allAvatarsArr) {
      const img = document.createElement('img');
      img.src = obj.url;
      img.loading = 'lazy';
      frag.appendChild(img);
    }
    // Append close block btn
    const closeBlockBtn = document.createElement('button');
    closeBlockBtn.textContent = 'CLOSE AVATAR SELECTION';
    closeBlockBtn.classList.add('close-all-avatars-block-btn');
    frag.appendChild(closeBlockBtn);
    // Append and show imgs
    allAvatarsBlock.appendChild(frag);
    allAvatarsBlock.classList.add('show');
  }
  // Avatar selection
  else if(target.closest('.all-avatars-block') && target.tagName === 'IMG') {
    if(isLoadingAvatar || e.target.src === profileAvatarPreview.src) return allAvatarsBlock.classList.remove('show');
    isLoadingAvatar = true;

    try {
      const {data, error} = await client.auth.getSession();
      if(error) {
        showResponseFn('Something went wrong...');
        return allAvatarsBlock.classList.remove('show');
      }

      const src = target.src;
      const id = data.session.user.id;

      const {error: updateError} = await client.from('user_content')
      .update({ profile: +allAvatarsArr.find(o => o.url === src).name.split('.')[0]})
      .eq('id', id);
      if(updateError) {
        allAvatarsBlock.classList.remove('show');
        return showResponseFn('Error: ' + updateError.message);
      };

      profileAvatarPreview.src = src;
      openBtnProfileImg.src = src;

      showResponseFn('✅ Profile updated');
      allAvatarsBlock.classList.remove('show');
    } catch(e) { console.log(e); }
    finally { isLoadingAvatar = false; }
  }
  // Close avatar selection
  else if(
    (
      target.classList.contains('close-all-avatars-block-btn')
      || allAvatarsBlock.classList.contains('show')
    ) && !target.classList.contains('all-avatars-block')
  ) allAvatarsBlock.classList.remove('show');
  // Open setting
  else if(target.closest('.open-settings-window')) initSettingsForOpen();
})
// Open
const openProfileWrapBtn = document.querySelector('.open-user-profile-wrap-btn');
openProfileWrapBtn.addEventListener('click', () => {
  closeAllWraps();
  totalBlockLimitsProgress.value = 0;
  profileWrap.classList.add('show');
  if(profileAvatarPreview.src !== openBtnProfileImg.src) profileAvatarPreview.src = openBtnProfileImg.src;
  initUserAccountInfo();
})

// All avatars block
const allAvatarsBlock = profileWrap.querySelector('.all-avatars-block');

// Profile avatar preview
const profileAvatarPreview = profileWrap.querySelector('.profile-img-preview');

// Open btn profile-img
const openBtnProfileImg = openProfileWrapBtn.firstElementChild;

// User account info
const userEmailInfo = profileWrap.querySelector('.user-email-info');

const userAccountInfoBlock = profileWrap.querySelector('.user-account-info');

const userTodosInfo = userAccountInfoBlock.querySelector('.todos');
const userNotesInfo = userAccountInfoBlock.querySelector('.notes');
const userNotesLengthInfo = userAccountInfoBlock.querySelector('.notes-length');
const userUrlsInfo = userAccountInfoBlock.querySelector('.urls');
const userCodesInfo = userAccountInfoBlock.querySelector('.codes');
const userCodesLengthInfo = userAccountInfoBlock.querySelector('.codes-length');

const allInfos = userAccountInfoBlock.children;

// Set all progress.max
userTodosInfo.lastElementChild.max = allBlockLimitsObj.todos;
userNotesInfo.lastElementChild.max = allBlockLimitsObj.notes;
userNotesLengthInfo.lastElementChild.max = allBlockLimitsObj.notes * 2000;
userUrlsInfo.lastElementChild.max = allBlockLimitsObj.urls;
userCodesInfo.lastElementChild.max = allBlockLimitsObj.codes;
userCodesLengthInfo.lastElementChild.max = allBlockLimitsObj.codes * 1500;

// Set all progress values after animation
const totalBlockLimitsProgress = profileWrap.querySelector('.total-block-limits');
totalBlockLimitsProgress.max = Object.values(allBlockLimitsObj).reduce((s, v) => s + v, 0);
userCodesLengthInfo.lastElementChild.addEventListener('animationend', () => setProgressValues());

function setProgressValues() {
  const allTodos = [...Object.keys(allTodosObj), ...Object.keys(hiddenTodosObj)];
  userTodosInfo.lastElementChild.value = allTodos.length; // Todo

  const allNotes = Object.keys(allNotesObj);
  userNotesInfo.lastElementChild.value = allNotes.length; // Note
  userNotesLengthInfo.lastElementChild.value = allNotes.reduce((sum, val) => sum + allNotesObj[val].txt.replaceAll('\n','').length, 0); // Note length

  userUrlsInfo.lastElementChild.value = allUrlsArr.length; // Url

  const allCodes = Object.keys(allUserCodesObj);
  userCodesInfo.lastElementChild.value = allCodes.length; // Code
  userCodesLengthInfo.lastElementChild.value = allCodes.reduce((sum, val) => sum + allUserCodesObj[val].code.replaceAll(' ','').replaceAll('\n','').length, 0); // Code length

  // total block limits progress
  totalBlockLimitsProgress.value = allTodos.length + allNotes.length + allUrlsArr.length + allCodes.length;
}

// Set all stats
async function initUserAccountInfo() {
  userTodosInfo.firstElementChild.textContent = `Todos: ${[...Object.keys(allTodosObj), ...Object.keys(hiddenTodosObj)].length}`;

  const allNotes = Object.keys(allNotesObj);
  userNotesInfo.firstElementChild.textContent = `Notes: ${allNotes.length}`;
  userNotesLengthInfo.firstElementChild.textContent = `Notes symbols: ${allNotes.reduce((sum, val) => sum + allNotesObj[val].txt.replaceAll('\n','').length, 0)}`;

  userUrlsInfo.firstElementChild.textContent = `Urls: ${allUrlsArr.length}`;

  const allCodes = Object.keys(allUserCodesObj);
  userCodesInfo.firstElementChild.textContent = `Code: ${allCodes.length}`;
  userCodesLengthInfo.firstElementChild.textContent = `Code symbols: ${allCodes.reduce((sum, val) => sum + allUserCodesObj[val].code.replaceAll(' ','').replaceAll('\n','').length, 0)}`;

  if(!userEmailInfo.length) {
    const {data, error} = await client.auth.getSession();
    if(error) return showResponseFn('Your account information could not be loaded. Please try again later.');
    if(!data.session) {
      showResponseFn('Please sign in or sign up');
      signWindow.classList.add('show');
      return profileWrap.classList.remove('show');
    }
    userEmailInfo.textContent = data.session.user.email;
  }

  // Info animation
  let n = 0.3;
  // Text animation
  for(let b of allInfos) {
    b = b.firstElementChild;
    b.classList.remove('init');
    void b.offsetWidth;
    b.style.animationDelay = `${n}s`;
    n += 0.3;
    b.classList.add('init');
  }
  // Progress animation
  for(let b of allInfos) {
    b = b.lastElementChild;
    b.value = 0;
    b.classList.remove('init');
    void b.offsetWidth;
    b.style.animationDelay = `${n}s`;
    n += 0.3;
    b.classList.add('init');
  }

  renderProfileWrapBlocksInfo();
}

// Wrap blocks
const selectWrapBlocksType = profileWrap.querySelector('.select-wrap-type');
selectWrapBlocksType.addEventListener('change', () => renderProfileWrapBlocksInfo());

const wrapBlocksContainer = profileWrap.querySelector('.all-wrap-blocks-container');
wrapBlocksContainer.addEventListener('click', e => {
  if(e.target.closest('.delete')) { // Delete
    if(localStorage.getItem('conf-before-delete') === 'true' && !confirm('Delete?')) return;

    const name = e.target.closest('.delete').parentElement.dataset.value;
    const val = selectWrapBlocksType.value;
    if(val === 'urls') {
      allUrlsArr = allUrlsArr.filter(obj => obj.title !== name);
      urlSaveBtn.classList.add('unsaved');
      setOpenBtnsTexts();
      return renderProfileWrapBlocksInfo();
    }
    const targetObj = val === 'todos' ? allTodosObj : val === 'notes' ? allNotesObj : allUserCodesObj;
    const saveBtn = val === 'todos' ? todoSaveBtn : val === 'notes' ? noteSaveBtn : codeSaveBtn;

    delete targetObj[name];
    saveBtn.classList.add('unsaved');
    setOpenBtnsTexts();
    renderProfileWrapBlocksInfo();

    searchProfileWrapBlocksInfoInput.value = '';
  }
  else if(e.target.closest('.info-block')) { // Open
    const block = e.target.closest('.info-block');
    const type = block.dataset.type;
    const name = block.dataset.value;
    if(type === 'todos') openTodoWrapBtn.click();
    else if(type === 'notes') openNoteWrapBtn.click();
    else if(type === 'urls') openUrlWrapBtn.click();
    else if(type === 'codes') openCodeWrapBtn.click();

    const targetContainer = type === 'todos'
    ? todosContainer : type === 'notes'
    ? allUserNotesCont : type === 'urls'
    ? allUrlsContainer : allUserCodesContainer;

    const targetBlock = targetContainer.querySelector(`[data-name="${name}"]`);
    targetBlock.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    })
  }
})

function renderProfileWrapBlocksInfo() {
  const val = selectWrapBlocksType.value;
  if(!val) return;

  const targetArr = val === 'todos' ? Object.keys(allTodosObj).map(n => {return {name: n, type: 'todo'}})
  : val === 'notes' ? Object.keys(allNotesObj).map(n => {return {name: n, type: 'notes'}})
  : val === 'urls' ? allUrlsArr.map(o => {return {name: o.title, type: 'urls'}})
  : val === 'codes' ? Object.keys(allUserCodesObj).map(n => {return {name: n, type: 'codes'}})
  : [
    ...Object.keys(allTodosObj).map(n => {return {name: n, type: 'todo'}}),
    ...Object.keys(allNotesObj).map(n => {return {name: n, type: 'notes'}}),
    ...allUrlsArr.map(o => {return {name: o.title, type: 'urls'}}),
    ...Object.keys(allUserCodesObj).map(n => {return {name: n, type: 'codes'}})
  ];

  const maxLimit = val === 'todos' ? allBlockLimitsObj.todos
  : val === 'notes' ? allBlockLimitsObj.notes
  : val === 'urls' ? allBlockLimitsObj.urls
  : val === 'codes' ? allBlockLimitsObj.codes
  : allBlockLimitsObj.todos + allBlockLimitsObj.notes + allBlockLimitsObj.urls + allBlockLimitsObj.codes;

  wrapBlocksContainer.textContent = '';
  const frag = document.createDocumentFragment();

  let num = 1;
  for(let n of targetArr) {
    const div = document.createElement('div');
    const p = document.createElement('p');
    const delBtn = document.createElement('button');

    div.classList.add('info-block');
    div.dataset.value = n.name;
    div.dataset.type = n.type;

    p.textContent = `${n.name} - ${num}/${maxLimit}`;
    num++;

    delBtn.classList.add('delete');
    delBtn.innerHTML = '<svg><use href=#delete-code></use></svg>';

    div.append(p, delBtn);
    frag.appendChild(div);
  }
  wrapBlocksContainer.appendChild(frag);
}

// Search wrap blocks
const searchProfileWrapBlocksInfoInput = profileWrap.querySelector('.search-profile-wrap-blocks-input');
searchProfileWrapBlocksInfoInput.addEventListener('input', () => renderProfileFoundWrapBlocksInfo(searchProfileWrapBlocksInfoInput.value.trim()));

function renderProfileFoundWrapBlocksInfo(txt) {
  const selectedValue = selectWrapBlocksType.value;
  if(!txt || !selectedValue) return renderProfileWrapBlocksInfo();

  const val = selectWrapBlocksType.value;

  const targetArr = val === 'todos' ? Object.keys(allTodosObj).map(n => {return {name: n, type: 'todo'}})
  : val === 'notes' ? Object.keys(allNotesObj).map(n => {return {name: n, type: 'notes'}})
  : val === 'urls' ? allUrlsArr.map(o => {return {name: o.title, type: 'urls'}})
  : val === 'codes' ? Object.keys(allUserCodesObj).map(n => {return {name: n, type: 'codes'}})
  : [
    ...Object.keys(allTodosObj).map(n => {return {name: n, type: 'todo'}}),
    ...Object.keys(allNotesObj).map(n => {return {name: n, type: 'notes'}}),
    ...allUrlsArr.map(o => {return {name: o.title, type: 'urls'}}),
    ...Object.keys(allUserCodesObj).map(n => {return {name: n, type: 'codes'}})
  ];

  const maxLimit = val === 'todos' ? allBlockLimitsObj.todos
  : val === 'notes' ? allBlockLimitsObj.notes
  : val === 'urls' ? allBlockLimitsObj.urls
  : val === 'codes' ? allBlockLimitsObj.codes
  : allBlockLimitsObj.todos + allBlockLimitsObj.notes + allBlockLimitsObj.urls + allBlockLimitsObj.codes;

  wrapBlocksContainer.textContent = '';
  const frag = document.createDocumentFragment();

  const safeTxt = txt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matchRegexp = new RegExp(safeTxt, 'i');
  const regexp = new RegExp(safeTxt, 'ig');

  let num = 1;
  for(let n of targetArr) {
    const arrName = n.name;
    if(!arrName.match(matchRegexp)) continue;

    const div = document.createElement('div');
    const p = document.createElement('p');
    const delBtn = document.createElement('button');

    div.classList.add('info-block');
    div.dataset.value = n.name;
    div.dataset.type = n.type;

    p.innerHTML = `${arrName.replaceAll(regexp, '<mark>$&</mark>')} - ${num}/${maxLimit}`;
    num++;

    delBtn.classList.add('delete');
    delBtn.innerHTML = '<svg><use href=#delete-code></use></svg>';

    div.append(p, delBtn);
    frag.appendChild(div);
  }
  wrapBlocksContainer.appendChild(frag);
}

// SETTINGS
const settingsWindow = document.querySelector('.settings-window'),
animationTimeSelect = document.querySelector('.animation-time-select');
const openSettingsWindow = profileWrap.querySelector('.open-settings-window');

// Close settings
settingsWindow.querySelector('.close-settings-window')
.addEventListener('click', () => {
  settingsWindow.classList.remove('show');
  totalBlockLimitsProgress.value = 0;
  profileWrap.classList.add('show');
  if(profileAvatarPreview.src !== openBtnProfileImg.src) profileAvatarPreview.src = openBtnProfileImg.src;
  initUserAccountInfo();
});

// Open settings into sidebar
allDashboardItem.querySelector('.open-settings-window-into-sidebar')
.addEventListener('click', () => {
  closeAllWraps();
  initSettingsForOpen();
});

animationTimeSelect.addEventListener('change', e => {
  const msNum = parseFloat(e.target.value) * 1000;
  delAnimTime = msNum;
  localStorage.setItem('del-anim-time', msNum);
  document.documentElement.style.setProperty('--del-animation-time', `${delAnimTime / 1000}s`);
})

// Note font-size sett
const noteFontSizeSettInput = document.querySelector('.notes-font-size-sett');
noteFontSizeSettInput.addEventListener('input', e => {
  const number = e.target.value;
  if(!e.target.value || !number) return localStorage.setItem('notes-font-size', 1.2);
  localStorage.setItem('notes-font-size', number);
})
noteFontSizeSettInput.addEventListener('blur', () => {
  let value = noteFontSizeSettInput.value;
  if(value.startsWith('.')) value = '0' + value;
  if(value.endsWith('.')) value += '0';
  localStorage.setItem('notes-font-size', value);
})

if(localStorage.getItem('disabled-anim') === 'true') document.documentElement.style.setProperty('--is-comp-anim-transition', 'none');
const disAnimBtn = document.querySelector('.disabled-animation-sett');
disAnimBtn.addEventListener('click', e => {
  const isDis = localStorage.getItem('disabled-anim') === 'true';
  if(isDis) {
    e.target.textContent = '✖️';
    document.documentElement.style.setProperty('--is-comp-anim-transition', 'box-shadow 1s')
  }
  else {
    e.target.textContent = '✔️';
    document.documentElement.style.setProperty('--is-comp-anim-transition', 'none');
  };
  localStorage.setItem('disabled-anim', !isDis);
})

// Conf before delete sett
const confBefDelBtn = document.querySelector('.conf-before-del-sett');
confBefDelBtn.addEventListener('click', e => {
  const isConfirm = localStorage.getItem('conf-before-delete') === 'true';
  if(isConfirm) e.target.textContent = '✖️';
  else e.target.textContent = '✔️';
  localStorage.setItem('conf-before-delete', !isConfirm);
})

// Microphone language
const selectMicLang = settingsWindow.querySelector('.select-mic-lang');
selectMicLang.addEventListener('change', () => {
  const val = selectMicLang.value;
  localStorage.setItem('mic-lang', val);
  currentMicLang = val;
})

// Set preloader value
preloaderProgress.value = 10;