// Set preloader text
whatIsLoadingText.textContent = 'Loading timer utilities...';

const timerWindow = document.querySelector('.timer-window');
// Open
const openTimerBtn = allDashboardItem.querySelector('.show-timer-window');
openTimerBtn.addEventListener('click', () => {
  timerWindow.classList.toggle('show');
  if(!selectitem.value) {
    selectType.value = 'todos';
    renderSelectItems(todosContainer);
  }
});
// Close
timerWindow.querySelector('.close-timer-window')
.addEventListener('click', () => timerWindow.classList.remove('show'));

const userReadyWindow = document.querySelector('.user-is-ready-window');
const userReadyTxtInfo = userReadyWindow.lastElementChild;
function setUserReadyInfoTxt(type, name) {
  userReadyTxtInfo.textContent = `Time is up! Ready to open:\n${type}${name ? (' => ' + name) : ''}?`;
}

const userIsReadyBtn = userReadyWindow.querySelector('.user-is-ready');
// User no ready
userReadyWindow.querySelector('.user-no-ready').addEventListener('click', () => {
  userReadyWindow.classList.remove('show');
  userIsReadyBtn.removeEventListener('click', userIsReadyEvent);
});

// Find item fn
function findItem(wrap, name) {
  let typeWrap = null;
  let block = null;
  let isCanOpen = false;
  let openBtn = null;
  if(wrap === 'todos') {
    block = [...todosContainer.children].find(block => block.firstElementChild.textContent === name);
    typeWrap = todoWrap;
  }
  else if(wrap === 'notes') {
    block = [...allUserNotesCont.children].find(block => block.firstElementChild.textContent === name);
    isCanOpen = true;
    typeWrap = notesWrap;
  }
  else if(wrap === 'urls') {
    block = [...allUrlsContainer.children].find(block => block.lastElementChild.textContent === name);
    typeWrap = saveUrlsWrap;
  }
  else if(wrap === 'codes') {
    block = [...allUserCodesContainer.children].find(block => block.firstElementChild.textContent === name);
    isCanOpen = true;
    typeWrap = userCodeWrap;
  }
  else if(wrap === 'exchange') {
    typeWrap = exchangeRateWrap;
    openBtn = openTimezoneWrapBtn;
  }
  else if(wrap === 'weather') {
    typeWrap = weatherWrap;
    openBtn = openWeatherWrapBtn;
  }
  else if(wrap === 'timezones') {
    typeWrap = timezoneWrap;
    openBtn = openExchangeRateWrapBtn;
  };

  return {block, open: isCanOpen, wrap: typeWrap, openBtn};
}

const setTimeInput = timerWindow.querySelector('.set-time-input');

const noContainerTypes = ['exchange', 'weather', 'timezones'];
const itemLabel = timerWindow.querySelector('label[for="item"]');
const selectType = timerWindow.querySelector('.select-type');
selectType.addEventListener('change', () => {
  const val = selectType.value;
  if(noContainerTypes.includes(val)) {
    itemLabel.style.display = 'none';
    selectitem.style.display = 'none';
  }
  else {
    itemLabel.style.display = 'block';
    selectitem.style.display = 'block';
  }

  if(val === 'todos') {
    renderTodos();
    renderSelectItems(todosContainer);
  }
  else if(val === 'notes') {
    renderNotesBlocks();
    renderSelectItems(allUserNotesCont);
  }
  else if(val === 'urls') {
    renderAllUrls();
    renderSelectItems(allUrlsContainer, true, true);
  }
  else if(val === 'codes') {
    renderUserCodesBlocks();
    renderSelectItems(allUserCodesContainer);
  }
})

// Render selects
const selectitem = timerWindow.querySelector('.select-type-item');
function renderSelectItems(container, isLastChild = false, isSpecial) {
  selectitem.textContent = '';

  for(let block of container.children) {
    const option = document.createElement('option');
    const val = isSpecial ? block.lastElementChild.firstElementChild.textContent
    : isLastChild ? block.lastElementChild.textContent : block.firstElementChild.textContent;
    option.value = val;
    option.textContent = val;
    selectitem.appendChild(option);
  }
}

// Init event
let userIsReadyEvent = () => {};

const timerProgress = timerWindow.querySelector('progress');
const timerTimeTxt = timerWindow.querySelector('.timer-time');

// Start timer
let timer = null;
let interval = null;
const startTimerBtn = timerWindow.querySelector('.start-timer-btn');
startTimerBtn.addEventListener('click', () => {
  const userTime = setTimeInput.value.match(/\d+\.?\d*[smh]/i);
  const type = selectType.value;
  const name = selectitem.value;

  if(!userTime) return showResponseFn('Set your time!');
  if(!type) return showResponseFn('Select type!');
  if(!name && !noContainerTypes.includes(type)) return showResponseFn('Select item!');
  isLocalTimer = false;

  const timeNumber = +userTime[0].match(/\d+\.?\d*/);
  const time = userTime[0].includes('s') ? (timeNumber * 1000)
  : userTime[0].includes('m') ? (timeNumber * 1000 * 60)
  : (timeNumber * 1000 * 60 * 60);

  const pointInfo = findItem(type, name);

  if(!pointInfo.block && !noContainerTypes.includes(type)) return showResponseFn(`${name} in ${type} is not defined`);
  if(!confirm(`Your time is ${userTime}?`)) return;

  userIsReadyBtn.removeEventListener('click', userIsReadyEvent);

  userIsReadyEvent = () => {
    userReadyWindow.classList.remove('show');
    closeAllWraps();

    if(!noContainerTypes.includes(type)) {
      pointInfo.wrap.classList.add('show');
      try {
        pointInfo.block.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
      } catch { return showResponseFn(`${name} in ${type} is not defined`) }
      if(pointInfo.open) pointInfo.block.click();
    } else pointInfo.openBtn.click();
  }
  userIsReadyBtn.addEventListener('click', userIsReadyEvent);

  // Show progress
  timerProgress.style.display = 'block';

  const allSeconds = time / 1000;
  const h = Math.floor(allSeconds / 3600);
  const m = Math.floor((allSeconds - h * 3600) / 60);
  const s = Math.floor(allSeconds % 60);

  timerProgress.max = allSeconds;
  let initSeconds = 0;

  let isAlmostStartBeen = false;
  let isHalfBeen = false;
  let isAlmostTheEndBeen = false;

  const almostStart = allSeconds * 0.25;
  const half = allSeconds / 2;
  const almost = allSeconds * 0.75;

  interval = setInterval(() => {
    initSeconds++;
    if(!isAlmostStartBeen && initSeconds >= almostStart) {
      showResponseFn('25% complete! (TIMER)');
      isAlmostStartBeen = true;
      if('vibrate' in navigator) navigator.vibrate(100)
    }
    else if(!isHalfBeen && initSeconds >= half) {
      showResponseFn('50% complete! (TIMER)');
      isHalfBeen = true;
      if('vibrate' in navigator) navigator.vibrate(250)
    }
    else if(!isAlmostTheEndBeen && initSeconds >= almost) {
      showResponseFn('75% complete! (TIMER)');
      isAlmostTheEndBeen = true;
      if('vibrate' in navigator) navigator.vibrate(500)
    }

    timerProgress.value = initSeconds;

    const initH = Math.floor(initSeconds / 3600);
    const initM = Math.floor((initSeconds - initH * 3600) / 60);
    const initS = Math.floor(initSeconds % 60);

    timerTimeTxt.textContent =
    `${h ? `${String(h).padStart(2, '0') + 'h : '}` : ''}${m ? `${String(m).padStart(2, '0') + 'm : '}` : ''}${String(s).padStart(2, '0') + 's'} / ${initH ? String(initH).padStart(2, '0') + 'h : ' : ''}${initM ? String(initM).padStart(2, '0') + 'm : ' : ''}${String(initS).padStart(2, '0') + 's'}`;
  }, 1000);

  timer = setTimeout(() => {
    setUserReadyInfoTxt(type, name);
    userReadyWindow.classList.add('show');
    startTimerBtn.classList.add('show');
    stopTimerBtn.classList.remove('show');
    timerTimeTxt.textContent = '';
    clearInterval(interval);
    timerProgress.style.display = 'none';
  }, time);

  stopTimerBtn.classList.add('show');
  startTimerBtn.classList.remove('show');
})
// Stop timer
const stopTimerBtn = timerWindow.querySelector('.stop-timer-btn');
stopTimerBtn.addEventListener('click', () => {
  if(!confirm('Stop?')) return;
  clearTimeout(timer);
  clearInterval(interval);
  timerProgress.style.display = 'none';
  timerTimeTxt.textContent = '';
  stopTimerBtn.classList.remove('show');
  startTimerBtn.classList.add('show');
  userIsReadyBtn.removeEventListener('click', userIsReadyEvent);
})

// Set preloader value
preloaderProgress.value = 6;