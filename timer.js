// Set preloader text
whatIsLoadingText.textContent = 'Loading timer utilities...';

const timerWindow = document.querySelector('.timer-window');
// Open timer window
document.querySelector('.show-timer-window')
.addEventListener('click', () => timerWindow.classList.toggle('show'));
// Close timer window
document.querySelector('.close-timer-window')
.addEventListener('click', () => timerWindow.classList.remove('show'));

const userReadyWindow = document.querySelector('.user-is-ready-window');
const userReadyTxtInfo = userReadyWindow.lastElementChild;
function setUserReadyInfoTxt(type, name) {
  userReadyTxtInfo.textContent = `Time is up! Ready to open:\n${type} => ${name}?`;
}

const userIsReadyBtn = userReadyWindow.querySelector('.user-is-ready');

userReadyWindow.querySelector('.user-no-ready').addEventListener('click', () => {
  userReadyWindow.classList.remove('show');
  userIsReadyBtn.removeEventListener('click', userIsReadyEvent);
});

// Start/stop timer
let timer = null;
function findItem(wrap, name) {
  let typeWrap = null;
  let block = null;
  let isCanOpen = false;
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

  return {block, open: isCanOpen, wrap: typeWrap};
}

const setTimeInput = timerWindow.querySelector('.set-time-input');
const selectType = timerWindow.querySelector('.select-type');

const selectitem = timerWindow.querySelector('.select-type-item');
function renderSelectItems(container, isLastChild = false) {
  selectitem.textContent = '';
  for(let block of container.children) {
    const option = document.createElement('option');
    const val = isLastChild ? block.lastElementChild.textContent : block.firstElementChild.textContent;
    option.value = val;
    option.textContent = val;
    selectitem.appendChild(option);
  }
}
selectitem.addEventListener('focus', () => {
  const val = selectType.value;
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
    renderSelectItems(allUrlsContainer, true);
  }
  else if(val === 'codes') {
    renderUserCodesBlocks();
    renderSelectItems(allUserCodesContainer);
  }
})

const timerStartTime = timerWindow.querySelector('.timer-start-time');
const timerDuration = timerWindow.querySelector('.timer-duration');

const startTimerBtn = timerWindow.querySelector('.start-timer-btn');
startTimerBtn.addEventListener('click', () => {
  const userTime = setTimeInput.value.match(/\d+\.?\d*[smh]/i);
  const type = selectType.value;
  const name = selectitem.value;

  if(!userTime) return showResponseFn('Set your time!');
  if(!type) return showResponseFn('Select type!');
  if(!name) return showResponseFn('Select item!');
  isLocalTimer = false;

  const timeNumber = +userTime[0].match(/\d+/);
  const time = userTime[0].includes('s') ? (timeNumber * 1000)
  : userTime[0].includes('m') ? (timeNumber * 1000 * 60)
  : (timeNumber * 1000 * 60 * 60);

  const pointInfo = findItem(type, name);

  if(!pointInfo.block) return showResponseFn(`${name} in ${type} is not defined`);
  if(!confirm(`Your time is ${userTime}?`)) return;

  userIsReadyBtn.removeEventListener('click', userIsReadyEvent);

  userIsReadyEvent = () => {
    userReadyWindow.classList.remove('show');
    timerWindow.classList.remove('show');
    settingsWindow.classList.remove('show');
    allStatsWrap.classList.remove('show');
    todoWrap.classList.remove('show');
    notesWrap.classList.remove('show');
    calculatorWrap.classList.remove('show');
    saveUrlsWrap.classList.remove('show');
    userCodeWrap.classList.remove('show');

    pointInfo.wrap.classList.add('show');
    try {
      pointInfo.block.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    } catch { return showResponseFn(`${name} in ${type} is not defined`) }
    if(pointInfo.open) pointInfo.block.click();
  }
  userIsReadyBtn.addEventListener('click', userIsReadyEvent);

  timer = setTimeout(() => {
    setUserReadyInfoTxt(type, name);
    userReadyWindow.classList.add('show');
    startTimerBtn.classList.add('show');
    stopTimerBtn.classList.remove('show');
    timerStartTime.textContent = '';
    timerDuration.textContent = '';
  }, time);

  stopTimerBtn.classList.add('show');
  startTimerBtn.classList.remove('show');

  const d = new Date();
  timerStartTime.textContent = `Start timer: ${d.getHours()} : ${d.getMinutes()} : ${d.getSeconds()}`;
  timerDuration.textContent = `Timer duration: ${userTime}`;
})

const stopTimerBtn = timerWindow.querySelector('.stop-timer-btn');
stopTimerBtn.addEventListener('click', () => {
  clearTimeout(timer);
  timerStartTime.textContent = '';
  timerDuration.textContent = '';
  stopTimerBtn.classList.remove('show');
  startTimerBtn.classList.add('show');
  userIsReadyBtn.removeEventListener('click', userIsReadyEvent);
})

// Set preloader value
preloaderProgress.value = 6;