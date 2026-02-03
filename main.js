// Set preloader text
whatIsLoadingText.textContent = 'Loading core functionality...';

const mls = localStorage.getItem('del-anim-time');
let delAnimTime = mls !== null ? +mls : 1500;
document.documentElement.style.setProperty('--del-animation-time', `${delAnimTime / 1000}s`);
// ============================

// All dashboard items(.--opened-btns)
const allDashboardItem = document.querySelector('.all-dashboard-items');

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

// Settings
const settingsWindow = document.querySelector('.settings-window'),
animationTimeSelect = document.querySelector('.animation-time-select');
document.querySelector('.open-settings-window')
.addEventListener('click', () => {
  if(localStorage.getItem('del-anim-time') !== null) {
    const val = +localStorage.getItem('del-anim-time') / 1000;
    animationTimeSelect.value = `${val}s`;
  };
  if(localStorage.getItem('disabled-anim') === 'true') disAnimBtn.textContent = '✔️';
  else disAnimBtn.textContent = '✖️';
  if(localStorage.getItem('conf-before-delete') === 'true') confBefDelBtn.textContent = '✔️';
  else confBefDelBtn.textContent = '✖️';
  settingsWindow.classList.add('show');

  noteFontSizeSettInput.value = localStorage.getItem('notes-font-size') || 1.2;
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

// Close settings
document.querySelector('.close-settings-window')
.addEventListener('click', () => settingsWindow.classList.remove('show'));

// Drag and drop window
let isDrag = false,
dragBlock = null,
x, y;
document.addEventListener('pointerup', () => {isDrag = false; dragBlock = null;})

document.addEventListener('pointerdown', e => {
  if(!e.target.parentElement.classList.contains('minimized') || e.target.tagName !== 'HEADER') return;
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