// Set preloader text
whatIsLoadingText.textContent = 'Loading core functionality...';

// All blocks limits
let allBlockLimitsObj = {}
// All values limits
let allValuesLimit = {}

const mls = localStorage.getItem('del-anim-time');
let delAnimTime = mls !== null ? +mls : 1500;
document.documentElement.style.setProperty('--del-animation-time', `${delAnimTime / 1000}s`);
// ============================

// All dashboard items(.--opened-btns)
const allDashboardItem = document.querySelector('.all-dashboard-items');
allDashboardItem.addEventListener('click', e => {
  if(e.target.tagName === 'BUTTON') document.body.style.overflow = 'hidden';
})

const allOpenBtns = allDashboardItem.querySelectorAll('.--opened-btn');
// Toggle
const toggleAllDashboardItemBtn = allDashboardItem.querySelector('.toggle-dashboard-items-btn');
toggleAllDashboardItemBtn.addEventListener('click', () => {
  allDashboardItem.classList.toggle('open');
  tagUseInToggleSidebarBtn.setAttribute('href', `#${allDashboardItem.classList.contains('open') ? 'close-panel' : 'open-panel'}`);

  if(allDashboardItem.classList.contains('open')) {
    // Toggle unsaved marks
    openTodoWrapBtn.classList.toggle('unsaved', todoSaveBtn.classList.contains('unsaved'));
    openNoteWrapBtn.classList.toggle('unsaved', noteSaveBtn.classList.contains('unsaved'));
    openUrlWrapBtn.classList.toggle('unsaved', urlSaveBtn.classList.contains('unsaved'));
    openCodeWrapBtn.classList.toggle('unsaved', codeSaveBtn.classList.contains('unsaved'));
    openTextsSnippetsWrap.classList.toggle('unsaved', textSaveBtn.classList.contains('unsaved'));
    openMusicWrapBtn.classList.toggle('unsaved', musicSaveBtn.classList.contains('unsaved'));

    // Set limits info
    setOpenBtnsTexts();

    // Set active wrap (for buttons)
    for(let b of allOpenBtns) b.classList.remove('active-btn');

    if(todoWrap.classList.contains('show')) openTodoWrapBtn.classList.add('active-btn');
    else if(notesWrap.classList.contains('show')) openNoteWrapBtn.classList.add('active-btn');
    else if(urlsWrap.classList.contains('show')) openUrlWrapBtn.classList.add('active-btn');
    else if(userCodeWrap.classList.contains('show')) openCodeWrapBtn.classList.add('active-btn');
    else if(textsSnippetsWrap.classList.contains('show')) openTextsSnippetsWrap.classList.add('active-btn');
    else if(musicWrap.classList.contains('show')) openMusicWrapBtn.classList.add('active-btn');

    else if(exchangeRateWrap.classList.contains('show')) openExchangeRateWrapBtn.classList.add('active-btn');
    else if(weatherWrap.classList.contains('show')) openWeatherWrapBtn.classList.add('active-btn');
    else if(timezoneWrap.classList.contains('show')) openTimezoneWrapBtn.classList.add('active-btn');
    else if(settingsWindow.classList.contains('show')) openSettingsWindowInSidebar.classList.add('active-btn');
    else if(assistantWrap.classList.contains('show')) openAssistantWrapBtn.classList.add('active-btn');
  }
})

const tagUseInToggleSidebarBtn = toggleAllDashboardItemBtn.querySelector('use');

// Close all wraps
function closeAllWraps() {
  assistantWrap.classList.remove('show');

  todoWrap.classList.remove('show');
  notesWrap.classList.remove('show');
  notesContentWrap.classList.remove('show');
  urlsWrap.classList.remove('show');
  userCodeWrap.classList.remove('show');
  textsSnippetsWrap.classList.remove('show');
  musicWrap.classList.remove('show');

  exchangeRateWrap.classList.remove('show');
  weatherWrap.classList.remove('show');
  timezoneWrap.classList.remove('show');
  githubWrap.classList.remove('show');

  profileWrap.classList.remove('show');
  settingsWindow.classList.remove('show');
  undoLastActionBlock.classList.remove('show');
  lastDataForUndoAction = null;

  commandRunnerWrap.classList.remove('show');

  if(allDashboardItem.classList.contains('open')) toggleAllDashboardItemBtn.click();
}

// Close all type-assistant windows
function closeAllTypeAssistantWindows() {
  notesContentAssistantWindow.classList.remove('open');
  codesContentAssistantWindow.classList.remove('open');
}

// Mark and render init wrap
function addUnsavedMarkAndRenderInitWrap() {
  if(todoWrap.classList.contains('show')) {
    todoSaveBtn.classList.add('unsaved');
    renderTodos();
  } else if(notesWrap.classList.contains('show')) {
    renderNotesBlocks();
    noteSaveBtn.classList.add('unsaved');
  } else if(urlsWrap.classList.contains('show')) {
    renderAllUrls();
    urlSaveBtn.classList.add('unsaved');
  } else if(userCodeWrap.classList.contains('show')) {
    renderUserCodesBlocks();
    codeSaveBtn.classList.add('unsaved');
  } else if(textsSnippetsWrap.classList.contains('show')) {
    renderTextsSnippets();
    textSaveBtn.classList.add('unsaved');
  } else if(musicWrap.classList.contains('show')) {
    renderMusic();
    musicSaveBtn.classList.add('unsaved');
  }
}

// Replace: htmlSymbols - symbol code; hash html symbols
function hashHtmlSymbols(content) {
  return content
  ?.replaceAll('&', '&amp;')
  ?.replaceAll('<', '&lt;')
  ?.replaceAll('>', '&gt;')
  ?.replaceAll('"', '&quot;')
  ?.replaceAll("'", '&#39;');
}
// Replace symbol code to symbol
function unhashHtmlSymbols(content) {
  return content
  ?.replaceAll('&lt;', '<')
  ?.replaceAll('&gt;', '>')
  ?.replaceAll('&quot;', '"')
  ?.replaceAll('&#39;', "'")
  ?.replaceAll('&amp;', '&');
}

// Load script
const header = document.querySelector('header');
async function loadScript(src) {
  await new Promise((res, rej) => {
    const script = document.createElement('script');
    script.src = src;
    header.appendChild(script);
    script.onload = () => res();
    script.onerror = () => rej();
  })
}

// Load codemirror
const allCodemirrorUrls = {
css: [
'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.15/codemirror.min.css',
'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.15/addon/fold/foldgutter.min.css',
"https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.15/addon/hint/show-hint.min.css",
],
js: [
'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.15/codemirror.min.js',
'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.15/mode/javascript/javascript.min.js',
'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.15/mode/css/css.min.js',
'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.15/mode/xml/xml.min.js',
'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.15/mode/htmlmixed/htmlmixed.min.js',
'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.15/addon/hint/show-hint.min.js',
"https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.15/addon/hint/xml-hint.min.js",
"https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.15/addon/hint/html-hint.min.js",
"https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.15/addon/hint/javascript-hint.min.js",
"https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.15/addon/hint/css-hint.min.js",
"https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.15/addon/edit/closetag.min.js",
"https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.15/addon/edit/closebrackets.min.js",
"https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.15/addon/fold/foldcode.min.js",
"https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.15/addon/fold/foldgutter.min.js",
"https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.15/addon/fold/brace-fold.min.js",
"https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.15/addon/selection/active-line.min.js",
"https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.15/addon/edit/matchbrackets.min.js",
"https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.15/addon/comment/comment.min.js",
]
};
let codeMirrorLoaded = false;
async function loadCodemirror() {
  // Load all codemirror css
    for(let h of allCodemirrorUrls.css) {
      const link = document.createElement('link');
      link.setAttribute('rel', "stylesheet");
      link.href = h;
      header.appendChild(link);
    }
    // Load all codemirror scripts
    for(let s of allCodemirrorUrls.js) await loadScript(s);

    codeMirrorLoaded = true;
}

// Show fields block
const showFieldsBlock = document.querySelector('.show-fields-block');
showFieldsBlock.addEventListener('click', e => {
  const targetP = e.target.closest('p');
  if(targetP) lastFocusedInput.value = targetP.dataset.value;
})
let lastFocusedInput = null;

function renderShowFieldsBlock(orgValuesArr, val, input, isName = false) {
  showFieldsBlock.textContent = '';
  const frag = document.createDocumentFragment();
  const safeVal = val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  for(let orgVal of orgValuesArr) {
    if(isName && !orgVal.includes(val)) continue;
    if(!isName && !orgVal.toLowerCase().includes(val.toLowerCase())) continue;
    if(!orgVal) continue;

    const p = document.createElement('p');
    p.dataset.value = orgVal;
    p.innerHTML = isName ? orgVal.replaceAll(val, '<mark>$&</mark>') : orgVal.replace(new RegExp(safeVal, 'gi'), '<mark>$&</mark>');
    p.tabIndex = 0;
    frag.appendChild(p);
  }
  showFieldsBlock.appendChild(frag);
  if(!showFieldsBlock.childElementCount) return showFieldsBlock.classList.remove('show');
  else {
    showFieldsBlock.classList.add('show');
    showFieldsBlock.style.top = `${input.getBoundingClientRect().top + 35}px`;
  }
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
    else if(textsSnippetsWrap.classList.contains('show')) toggleAddTextSnippetForm.click();
    else if(musicWrap.classList.contains('show')) toggleAddMusicFormBtn.click();
  }
  // OPen side panel
  else if(e.ctrlKey && e.code === 'KeyP') {
    e.preventDefault();
    toggleAllDashboardItemBtn.click();
  }

  // Close focus code wrap
  else if(focusWrap.classList.contains('show') && e.key === 'Escape') closeFocusBtn.click();

  // Show fields block
  else if(showFieldsBlock.classList.contains('show')) {
    if(e.key === 'ArrowUp') {
      const allElements = [...showFieldsBlock.children];
      if(!allElements.length) return showFieldsBlock.classList.remove('show');

      const activeEl = document.activeElement;
      if(!activeEl.closest('.show-fields-block')) return allElements[0].focus();

      const activeElIdx = allElements.indexOf(activeEl);
      if(activeElIdx <= 0) return;
      else allElements[activeElIdx - 1].focus();
    }
    else if(e.key === 'ArrowDown') {
      const allElements = [...showFieldsBlock.children];
      if(!allElements.length) return showFieldsBlock.classList.remove('show');

      const activeEl = document.activeElement;
      if(!activeEl.closest('.show-fields-block')) return allElements[0].focus();

      const activeElIdx = allElements.indexOf(activeEl);
      if(activeElIdx >= allElements.length - 1) return;
      else allElements[activeElIdx + 1].focus();
    }
    else if(e.key === 'Enter') {
      const allElements = [...showFieldsBlock.children];
      const activeEl = document.activeElement;
      if(!activeEl.closest('.show-fields-block') && activeEl.tagName === 'INPUT' && allElements.length) activeEl.value = allElements[0].dataset.value;
      else if(lastFocusedInput) {
        lastFocusedInput.value = activeEl.dataset.value;
        lastFocusedInput.focus();
      }
      showFieldsBlock.classList.remove('show');
    }
    else if(e.key === 'Tab') {
      if(!document.activeElement.closest('.show-fields-block')) showFieldsBlock.classList.remove('show');
    }
  }

  // Global enter
  else if(e.key === 'Enter') {
    if(assistantWrap.classList.contains('show') && !e.shiftKey && !memoryForAiWindow.classList.contains('show')) {
      e.preventDefault();
      sendPromptBtn.click();
    } else if(notesContentAssistantWindow.classList.contains('open') && !e.shiftKey) {
      e.preventDefault();
      sendNotesContentPromptBtn.click();
    } else if(codesContentAssistantWindow.classList.contains('open') && !e.shiftKey) {
      e.preventDefault();
      sendCodesContentAssistantPromptBtn.click();
    }

    else if(addTodoForm.classList.contains('show')) todoAddBtn.click();
    else if(addUrlForm.classList.contains('show')) addUrlBtn.click();
    else if(addNotesForm.classList.contains('show')) addNotesButton.click();
    else if(addCodeBlockForm.classList.contains('show')) addCodeBlockBtn.click();
    else if(editNoteBlock.classList.contains('show')) confNoteEditChangeBtn.click();
    else if(addMusicForm.classList.contains('show')) addMusicBtn.click();
  }
})

// Document click event
document.addEventListener('click', e => {
  if(allDashboardItem.classList.contains('open') && !e.target.closest('.all-dashboard-items')) toggleAllDashboardItemBtn.click();
  if(!e.target.closest('.type-assistant') && !e.target.classList.contains('toggle-type-assistant')) closeAllTypeAssistantWindows();

  if(showFieldsBlock.classList.contains('show') && !e.target.closest('.show-fields-block')) showFieldsBlock.classList.remove('show');
})

// Theme switcher
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

// Undo last action
let lastDataForUndoAction = null;

const undoLastActionBlock = document.querySelector('.undo-last-action-block');
const undoLastActionBtn = undoLastActionBlock.lastElementChild;
undoLastActionBtn.addEventListener('click', () => {
  const type = lastDataForUndoAction?.type;
  if(!lastDataForUndoAction || !type) return;
  undoLastActionBlock.classList.remove('show');

  if(type === 'todos') {
    allTodosObj = lastDataForUndoAction.content;
    todoSaveBtn.classList.toggle('unsaved', lastDataForUndoAction.isSaved);
    renderTodos();
  }
  else if(type === 'notes') {
    allNotesObj = lastDataForUndoAction.content;
    noteSaveBtn.classList.toggle('unsaved', lastDataForUndoAction.isSaved);
    renderNotesBlocks();
  }
  else if(type === 'urls') {
    allUrlsObj = lastDataForUndoAction.content;
    urlSaveBtn.classList.toggle('unsaved', lastDataForUndoAction.isSaved);
    renderAllUrls();
  }
  else if(type === 'codes') {
    allUserCodesObj = lastDataForUndoAction.content;
    codeSaveBtn.classList.toggle('unsaved', lastDataForUndoAction.isSaved);
    renderUserCodesBlocks();
  }
  else if(type === 'texts') {
    allTextsSnippetsObj = lastDataForUndoAction.content;
    textSaveBtn.classList.toggle('unsaved', lastDataForUndoAction.isSaved);
    renderTextsSnippets();
  }
  else if(type === 'music') {
    allMusicObj = lastDataForUndoAction.content;
    musicSaveBtn.classList.toggle('unsaved', lastDataForUndoAction.isSaved);
    renderMusic();
  }
  else return;

  clearTimeout(undoTimeout);
  lastDataForUndoAction = null;
})

let undoTimeout = null;
function initUndoActionBlock(type, content) {
  clearTimeout(undoTimeout);
  undoTimeout = setTimeout(() => {
    lastDataForUndoAction = null;
    undoLastActionBlock.classList.remove('show');
  }, 15000);

  lastDataForUndoAction = {type, content: JSON.parse(JSON.stringify(content))};
  let saveBtn = type === 'todos' ? todoSaveBtn : type === 'notes' ? noteSaveBtn : type === 'urls' ? urlSaveBtn : type === 'codes' ? codeSaveBtn : type === 'texts' ? textSaveBtn : musicSaveBtn;
  lastDataForUndoAction.isSaved = saveBtn.classList.contains('unsaved');

  undoLastActionBlock.classList.add('show');
}

// Show response function
const showResponseText = document.querySelector('.show-response');
function showResponseFn(text) {
  showResponseText.classList.remove('show');
  void showResponseText.offsetWidth;
  showResponseText.textContent = text;
  showResponseText.classList.add('show');
}

// Speaker, voice eventListeners
let initVoiceTextarea = null;
let currentMicLang = localStorage.getItem('mic-lang') || 'en-US';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.interimResults = false;

recognition.onresult = (event) => {
  const text = event.results[0][0].transcript;
  initVoiceTextarea.value = text;
  initVoiceTextarea.parentElement.querySelector('.send-prompt-btn').textContent = '=>';
};
recognition.onend = () => speakWindow.classList.remove('show');
recognition.onerror = (event) => {
  showResponseFn(event.error);
  console.error('Speech error:', event.error);
};

const speakWindow = document.querySelector('.speak-window');
function initSpeakWindow(textarea) {
  recognition.lang = currentMicLang;
  initVoiceTextarea = textarea;
  speakWindow.classList.add('show');
  recognition.start();
}

// Show internet status
const noInternetIcon = document.querySelector('.no-internet-icon');
window.addEventListener('online', () => noInternetIcon.style.display = 'none');
window.addEventListener('offline', () => noInternetIcon.style.display = 'block');

// Set preloader value
preloaderProgress.value = 1;