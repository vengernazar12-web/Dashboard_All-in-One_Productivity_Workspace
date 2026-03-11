// Set preloader text
whatIsLoadingText.textContent = 'Loading core functionality...';

// All blocks limits
const allBlockLimitsObj = {
  todos: 100,
  notes: 25,
  urls: 25,
  codes: 25,
}
// All values limits
const allValuesLimit = {
  todoName: 25,
  todoMark: 12,
  todoTag: 25,
  urlTitle: 50,
  codeName: 25,
  noteName: 50,
  noteDesc: 250,
}

const mls = localStorage.getItem('del-anim-time');
let delAnimTime = mls !== null ? +mls : 1500;
document.documentElement.style.setProperty('--del-animation-time', `${delAnimTime / 1000}s`);
// ============================

// All dashboard items(.--opened-btns)
const allDashboardItem = document.querySelector('.all-dashboard-items');
allDashboardItem.addEventListener('click', e => {
  if(e.target.tagName === 'BUTTON') document.body.style.overflow = 'hidden';
})
// Toggle
const toggleAllDashboardItemBtn = allDashboardItem.querySelector('.toggle-dashboard-items-btn');
toggleAllDashboardItemBtn.addEventListener('click', () => {
  allDashboardItem.classList.toggle('open');
  tagUseInToggleSidebarBtn.setAttribute('href', `#${allDashboardItem.classList.contains('open') ? 'close-panel' : 'open-panel'}`);
})

const tagUseInToggleSidebarBtn = toggleAllDashboardItemBtn.querySelector('use');

// Close all wraps
function closeAllWraps() {
  todoWrap.classList.remove('show');
  notesWrap.classList.remove('show');
  urlsWrap.classList.remove('show');
  userCodeWrap.classList.remove('show');
  exchangeRateWrap.classList.remove('show');
  weatherWrap.classList.remove('show');
  timezoneWrap.classList.remove('show');
  assistantWrap.classList.remove('show');
  profileWrap.classList.remove('show');
  settingsWindow.classList.remove('show');
  if(allDashboardItem.classList.contains('open')) toggleAllDashboardItemBtn.click();
}

// Show body scroll fn
function showBodyScroll() {
  if(
    !todoWrap.classList.contains('show')
    && !notesWrap.classList.contains('show')
    && !urlsWrap.classList.contains('show')
    && !userCodeWrap.classList.contains('show')
  ) document.body.style.overflow = 'auto';
}

// Key... events
document.addEventListener('keydown', e => {
  if(notesWrap.classList.contains('show') && (e.key === '<' || e.key === '>' || e.key === '&' || e.key === '/')) e.preventDefault();
  else if(e.ctrlKey && e.code === 'KeyH') {
    e.preventDefault();
    if(notesWrap.classList.contains('show')) openAddNoteForm.click();
    else if(userCodeWrap.classList.contains('show')) toggleAddCodeBlockForm.click();
    else if(urlsWrap.classList.contains('show')) toggleUrlFormBtn.click();
    else if(todoWrap.classList.contains('show')) toggleAddTodoForm.click();
  }
  else if(e.ctrlKey && e.code === 'KeyP') {
    e.preventDefault();
    toggleAllDashboardItemBtn.click();
  }

  else if(focusWrap.classList.contains('show') && e.key === 'Escape') closeFocusBtn.click();

  else if(e.key === 'Enter') {
    if(addTodoForm.classList.contains('show')) todoAddBtn.click();
    else if(addUrlForm.classList.contains('show')) addUrlBtn.click();
    else if(addNotesForm.classList.contains('show')) addNotesButton.click();
    else if(addCodeBlockForm.classList.contains('show')) addCodeBlockBtn.click();
    else if(assistantWrap.classList.contains('show') && !e.shiftKey) {
      e.preventDefault();
      sendPromptBtn.click();
    }
    else if(editNoteBlock.classList.contains('show')) confNoteEditChangeBtn.click();
  }
})

// Document click event
document.addEventListener('click', e => {
  if(allDashboardItem.classList.contains('open') && !e.target.closest('.all-dashboard-items')) toggleAllDashboardItemBtn.click();
})

/* Theme switcher */
const DashboardSwitchTheme = document.querySelector('[data-theme-switcher]');
DashboardSwitchTheme.addEventListener('click', () => setDashboardTheme())
function setDashboardTheme() {
  const theme = localStorage.getItem('todo-theme');
  if(theme === 'dark') {
    localStorage.setItem('todo-theme', 'light');
    document.documentElement.classList.remove('dark-theme');
    DashboardSwitchTheme.textContent = '☀️';
  }
  else {
    localStorage.setItem('todo-theme', 'dark');
    document.documentElement.classList.add('dark-theme');
    DashboardSwitchTheme.textContent = '🌑';
  }
}

if(localStorage.getItem('todo-theme') === 'dark') {
  document.documentElement.classList.add('dark-theme');
  DashboardSwitchTheme.textContent = '🌑';
}
else DashboardSwitchTheme.textContent = '☀️';

// Show response function
const showResponseText = document.querySelector('.show-response');
function showResponseFn(text) {
  showResponseText.classList.remove('show');
  void showResponseText.offsetWidth;
  showResponseText.textContent = text;
  showResponseText.classList.add('show');
}

// Set preloader value
preloaderProgress.value = 1;