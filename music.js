const musicWrap = document.querySelector('.music-wrap');
musicWrap.addEventListener('click', e => {
  if(!e.target.closest('.edit') && !e.target.closest('.edit-music-block')) editMusicBlock.classList.remove('show');
  if(!e.target.classList.contains('toggle-add-music-form') && !e.target.closest('.add-music-form')) addMusicForm.classList.remove('show');
})
// Open
const openMusicWrapBtn = allDashboardItem.querySelector('.open-music-wrap');
openMusicWrapBtn.addEventListener('click', async () => {
  closeAllWraps();

  if(!allMusicObj) {
    showPreloader();
    preloaderProgress.max = 1;
    preloaderProgress.value = 0;
    whatIsLoadingText.textContent = 'Take content...';

    allMusicObj = await getContent('music');
    if(!allMusicObj) return;

    preloaderProgress.value = 1;
    whatIsLoadingText.textContent = 'Content taken';
    setTimeout(() => showPreloader(false), 500);
  }

  renderMusic();
  musicWrap.classList.add('show');
})

let allMusicObj = null;

const musicProgress = musicWrap.querySelector('.music-progress');
const musicProgressTxt = musicWrap.querySelector('.music-progress-txt');

// All music container
const allMusicContainer = musicWrap.querySelector('.all-music-container');
allMusicContainer.addEventListener('click', e => {
  const target = e.target;
  if(target.closest('.delete')) { // Delete music block
    if(localStorage.getItem('conf-before-delete') === 'true' && !confirm('Delete?')) return;

    const initBlock = target.closest('.music-block');
    const blockName = initBlock.dataset.name;

    initUndoActionBlock('music', allMusicObj);

    delete allMusicObj[blockName];
    musicSaveBtn.classList.add('unsaved');

    if(localStorage.getItem('disabled-anim') === 'true') return renderMusic();

    initBlock.classList.add('del-anim');
    setTimeout(() => renderMusic(), delAnimTime);
  }
  else if(target.closest('.favorite')) { // Favorite music block
    const initBlock = target.closest('.music-block');
    const blockName = initBlock.dataset.name;

    allMusicObj[blockName].isFav = !allMusicObj[blockName].isFav;
    renderMusic();
    musicSaveBtn.classList.add('unsaved');
  }
  else if(target.closest('.edit')) { // Open edit music block
    const initBlock = target.closest('.music-block');
    const blockName = initBlock.dataset.name;
    const blockMusicUrl = allMusicObj[blockName].musicUrl;

    musicNameBeforeEdit = blockName;
    musicUrlBeforeEdit = blockMusicUrl;

    editMusicNameInput.value = blockName;
    editMusicUrlInput.value = blockMusicUrl;

    editMusicBlock.classList.add('show');
  }
  else if(target.closest('.music-block') && !e.target.closest('.all-block-btns')) { // Start music on click
    const initBlock = target.closest('.music-block');
    const blockName = initBlock.dataset.name;
    startMusic(blockName);
  }
})

function createMusicBlock(name, searchVal = null) {
  const regexp = !searchVal ? null : new RegExp(hashHtmlSymbols(searchVal, 'ig'));

  const div = document.createElement('div'),
  h4 = document.createElement('h4'),
  p = document.createElement('p'),
  allBtns = document.createElement('div'),
  delBtn = document.createElement('button'),
  favBtn = document.createElement('button'),
  editBtn = document.createElement('button');

  div.classList.add('music-block');
  div.dataset.name = name;

  !searchVal ? h4.textContent = name : h4.innerHTML = hashHtmlSymbols(name).replace(regexp, '<mark>$&</mark>');
  !searchVal ? p.textContent = allMusicObj[name].musicUrl : p.innerHTML = hashHtmlSymbols(name).replace(regexp, '<mark>$&</mark>')

  delBtn.innerHTML = '<svg><use href="#delete-code"></use></svg>';
  delBtn.classList.add('delete');
  favBtn.innerHTML = '<svg><use href="#favorite-icon"></use></svg>';
  favBtn.classList.add('favorite');
  favBtn.firstElementChild.style.color = allMusicObj[name].isFav ? 'yellow' : 'white';
  editBtn.innerHTML = '<svg><use href="#edit"></use></svg>';
  editBtn.classList.add('edit');

  allBtns.append(delBtn, favBtn, editBtn);
  allBtns.classList.add('all-block-btns');
  div.append(h4, p, allBtns);
  return div;
}

function renderMusic() {
  allMusicContainer.textContent = '';
  const frag = document.createDocumentFragment();

  const allNames = Object.keys(allMusicObj);

  // Render favorites
  for(let n of allNames) if(allMusicObj[n].isFav) frag.appendChild(createMusicBlock(n));
  // Render no favorites
  for(let n of allNames) if(!allMusicObj[n].isFav) frag.appendChild(createMusicBlock(n));

  allMusicContainer.appendChild(frag);

  musicProgress.value = allNames.length;
  musicProgressTxt.textContent = `${allNames.length}/${allBlockLimitsObj.music}`;
}

// Add music block
const addMusicForm = musicWrap.querySelector('.add-music-form');
// Toggle
const toggleAddMusicFormBtn = musicWrap.querySelector('.toggle-add-music-form');
toggleAddMusicFormBtn.addEventListener('click', () => {
  addMusicForm.classList.toggle('show');
  addMusicNameInput.focus();
})

const addMusicNameInput = addMusicForm.querySelector('.name');
const addMusicUrlInput = addMusicForm.querySelector('.music-url');

const addMusicBtn = addMusicForm.querySelector('.add-music-btn');
addMusicBtn.addEventListener('click', () => {
  addMusicForm.classList.remove('show');
  const allNames = Object.keys(allMusicObj);
  if(allNames.length >= allBlockLimitsObj.music) return showResponseFn(`You have ${allNames.length}/${allBlockLimitsObj.music} music blocks`);

  const name = addMusicNameInput.value.trim();
  if(!name) return showResponseFn("You don't have name");
  if(allNames.find(n => n === name)) return showResponseFn('You already used this name');
  if(name.length > allValuesLimit.musicName) return showResponseFn(`Name is too long (${name.length}/${allValuesLimit.musicName})`);

  let musicUrl = addMusicUrlInput.value.trim();
  if(!musicUrl) return showResponseFn("You don't have name");
  if(!musicUrl.startsWith('http')) musicUrl = `https://${musicUrl}`;
  if(allNames.find(n => allMusicObj[n].musicUrl === musicUrl)) return showResponseFn('You already have this music url');

  initUndoActionBlock('music', allMusicObj);
  allMusicObj[name] = { musicUrl };
  renderMusic();

  musicSaveBtn.classList.add('unsaved');
})

// Search music
musicWrap.querySelector('.search-music-input')
.addEventListener('input', e => {
  const val = e.target.value.trim().toLowerCase();
  if(!val) return renderMusic();

  const safeVal = val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  allMusicContainer.textContent = '';
  const frag = document.createDocumentFragment();
  const allNames = Object.keys(allMusicObj);

  // Render favorites
  for(let n of allNames) if((n.toLowerCase().includes(val) || allMusicObj[n].musicUrl.toLowerCase().includes(val)) && allMusicObj[n].isFav) frag.appendChild(createMusicBlock(n, safeVal));
  // Render no favorites
  for(let n of allNames) if((n.toLowerCase().includes(val) || allMusicObj[n].musicUrl.toLowerCase().includes(val)) && !allMusicObj[n].isFav) frag.appendChild(createMusicBlock(n, safeVal));

  allMusicContainer.appendChild(frag);
  if(!allMusicContainer.childElementCount) allMusicContainer.innerHTML = '<h2>No music found...</h2>';
})

// Edit music
let musicNameBeforeEdit = null;
let musicUrlBeforeEdit = null;

const editMusicBlock = musicWrap.querySelector('.edit-music-block');
const editMusicNameInput = editMusicBlock.querySelector('.name');
const editMusicUrlInput = editMusicBlock.querySelector('.music-url');

editMusicBlock.querySelector('.confirm')
.addEventListener('click', () => {
  const allNames = Object.keys(allMusicObj);

  const name = editMusicNameInput.value.trim();
  if(!name) return showResponseFn("You don't have name");
  if(name.length > allValuesLimit.musicName) return showResponseFn(`You name is too long (${name.length}/${allValuesLimit.musicName})`);
  if(allNames.find(n => n === name && name !== musicNameBeforeEdit)) return showResponseFn('You already used this name');

  const musicUrl = editMusicUrlInput.value.trim();
  if(!musicUrl) return showResponseFn("You don't have name");
  if(allNames.find(n => allMusicObj[n].musicUrl === musicUrl && musicUrl !== musicUrlBeforeEdit)) return showResponseFn('You already used thi music url');

  if(name === musicNameBeforeEdit && musicUrl === musicUrlBeforeEdit) return editMusicBlock.classList.remove('show');

  initUndoActionBlock('music', allMusicObj);

  allMusicObj[musicNameBeforeEdit].musicUrl = musicUrl;
  const objForEdit = allMusicObj[musicNameBeforeEdit];
  delete allMusicObj[musicNameBeforeEdit];
  allMusicObj[name] = objForEdit;

  editMusicBlock.classList.remove('show');

  musicSaveBtn.classList.add('unsaved');
  renderMusic();
})

// Start music/Play music
let musicPlayMode = null;

let minutesDuration = null;
let secondsDuration = null;

let currentMusicName = null;

const showInitMusicBlock = musicWrap.querySelector('.show-init-music-block');
const showInitMusicName = showInitMusicBlock.firstElementChild;

const initMusicAudio = showInitMusicBlock.lastElementChild;
initMusicAudio.addEventListener('error', () => {
  showResponseFn('This music URL gives an error, try another one.');
  console.log(initMusicAudio.error);
})

let arrForRandomLoop = [];
let idxForRandomLoop = 0;
function initRandomLoopArr() {
  arrForRandomLoop = Object.keys(allMusicObj);
  for(let i = 0; i < arrForRandomLoop.length; i++) {
    const randomIdx = Math.floor(Math.random() * arrForRandomLoop.length);
    const randomName = arrForRandomLoop[randomIdx];
    arrForRandomLoop[randomIdx] = arrForRandomLoop[i];
    arrForRandomLoop[i] = randomName;
  }
  idxForRandomLoop = 0;
}

initMusicAudio.addEventListener('ended', () => {
  if(musicPlayMode === 'loop') {
    initMusicAudio.currentTime = 0;
    initMusicAudio.play();
  }

  else if(musicPlayMode === 'random-loop') {
    if(idxForRandomLoop >= arrForRandomLoop.length) initRandomLoopArr();
    startMusic(arrForRandomLoop[idxForRandomLoop]);
    idxForRandomLoop++;
  }

  else {
    const allMusic = Object.keys(allMusicObj);
    let initMusicIdx = allMusic.indexOf(currentMusicName) + 1;
    if(initMusicIdx >= allMusic.length) {
      playMusicBtn.classList.remove('is-active');
      return;
    };

    startMusic(allMusic[initMusicIdx]);
  }
})

initMusicAudio.addEventListener('loadedmetadata', () => {
  const allSeconds = initMusicAudio.duration;
  if(isNaN(allSeconds)) {
    minutesDuration = '00';
    secondsDuration = '00';
    return;
  };
  playMusicProgress.max = allSeconds;

  const m = Math.floor(allSeconds / 60);
  const s = Math.floor(allSeconds % 60);

  minutesDuration = String(m).padStart(2, '0');
  secondsDuration = String(s).padStart(2, '0');
})

initMusicAudio.addEventListener('timeupdate', () => {
  const initSeconds = initMusicAudio.currentTime;
  playMusicProgress.value = initSeconds;

  const m = Math.floor(initSeconds / 60);
  const s = Math.floor(initSeconds % 60);
  playMusicProgressTxt.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} / ${minutesDuration || '00'}:${secondsDuration || '00'}`;
})

const playMusicBtn = showInitMusicBlock.querySelector('.play-music');
playMusicBtn.addEventListener('click', () => {
  if(!currentMusicName || initMusicAudio.readyState < 1) return;

  if(!playMusicBtn.classList.contains('is-active')) initMusicAudio.play();
  else initMusicAudio.pause();

  playMusicBtn.classList.toggle('is-active', !playMusicBtn.classList.contains('is-active'));
  setMusicPlayingClass(!playMusicBtn.classList.contains('is-active') ? false : currentMusicName);
})

const playMusicProgress = showInitMusicBlock.querySelector('.play-music-progress');
playMusicProgress.addEventListener('click', e => {
  const mouseX = e.offsetX;
  const progressWidth = playMusicProgress.clientWidth;
  const value = (mouseX / progressWidth) * initMusicAudio.duration;
  initMusicAudio.currentTime = value;
})

const playMusicProgressTxt = showInitMusicBlock.querySelector('.play-music-progress-txt');

const selectMusicPlayMode = musicWrap.querySelector('.select-music-play-mode');
selectMusicPlayMode.addEventListener('change', () => {
  const val = selectMusicPlayMode.value;
  if(val === 'loop') {
    if(!currentMusicName) {
      selectMusicPlayMode.value = '';
      return showResponseFn('The music is not playing right now.');
    };
    if(initMusicAudio.paused) startMusic(currentMusicName);
    musicPlayMode = 'loop';
  }
  else if(val === 'random-loop') {
    const allNames = Object.keys(allMusicObj);
    if(allNames.length <= 1) {
      selectMusicPlayMode.value = '';
      if(allNames[0]) startMusic(allNames[0]);
      return showResponseFn('Random only works with 2+ music blocks.');
    }

    if(initMusicAudio.paused) startMusic(allNames[Math.floor(Math.random() * allNames.length)]);
    musicPlayMode = 'random-loop';

    initRandomLoopArr();
  }

  else musicPlayMode = '';
})

function startMusic(name) {
  showInitMusicName.textContent = name;
  currentMusicName = name;

  playMusicBtn.classList.remove('is-active');
  initMusicAudio.pause();

  if(initMusicAudio.src !== allMusicObj[name].musicUrl) initMusicAudio.src = allMusicObj[name].musicUrl;
  initMusicAudio.currentTime = 0;

  playMusicBtn.classList.add('is-active');
  initMusicAudio.play();

  // Set active/play class
  setMusicPlayingClass(name);
}

function setMusicPlayingClass(name) {
  // Set active/play class
  for(let m of allMusicContainer.querySelectorAll('.music-block')) {
    if(name && m.dataset.name === name) m.classList.add('is-playing');
    else m.classList.remove('is-playing');
  }
}