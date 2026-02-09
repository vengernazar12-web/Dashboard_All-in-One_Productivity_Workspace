// Set preloader text
whatIsLoadingText.textContent = 'Loading core functionality...';

// All blocks limits
const allBlockLimitsObj = {
  todos: 100,
  notes: 25,
  urls: 25,
  codes: 25,
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
  }

  else if(focusWrap.classList.contains('show') && e.key === 'Escape') closeFocusBtn.click();

  else if(e.key === 'Enter') {
    if(todoWrap.classList.contains('show')) todoAddBtn.click();
    else if(addUrlForm.classList.contains('show')) addUrlBtn.click();
    else if(addNotesForm.classList.contains('show')) addNotesButton.click();
    else if(addCodeBlockForm.classList.contains('show')) addCodeBlockBtn.click();
  }
})

/* Open/close mini-window events */
for(let b of document.querySelectorAll('.min-wrap')) {
  b.addEventListener('click', () => {
    b.parentElement.removeAttribute('style');
    b.parentElement.classList.toggle('minimized');
})}

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

// Drag and drop window
let isDrag = false,
dragBlock = null,
x, y;
document.addEventListener('pointerup', () => {isDrag = false; dragBlock = null;})

document.addEventListener('pointerdown', e => {
  if(!e.target.parentElement?.classList.contains('minimized') || e.target.tagName !== 'HEADER') return;
  isDrag = true;
  dragBlock = e.target.parentElement;
  const blockObj = dragBlock.getBoundingClientRect();
  x = e.clientX - blockObj.left;
  y = e.clientY - blockObj.top;
})

document.addEventListener('pointermove', e => {
  if(!isDrag || !dragBlock) return;
  let left = e.clientX - x,
  top = e.clientY - y;

  left = Math.max(0, left);
  top = Math.max(0, top);

  const bObj = dragBlock.getBoundingClientRect();

  dragBlock.style.left = Math.min(left, window.innerWidth - bObj.width) + 'px';
  dragBlock.style.top = Math.min(top, window.innerHeight - bObj.height) + 'px';
})

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