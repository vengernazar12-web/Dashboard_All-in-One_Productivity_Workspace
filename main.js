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
  notesContentWrap.classList.remove('show');
  hiddenTodosWindow.classList.remove('show');
  if(allDashboardItem.classList.contains('open')) toggleAllDashboardItemBtn.click();
}

// Close all type-assistant windows
function closeAllTypeAssistantWindows() {
  todosAssistantWindow.classList.remove('open');
  notesContentAssistantWindow.classList.remove('open');
  notesAssistantWindow.classList.remove('open');
  urlsAssistantWindow.classList.remove('open');
  codesAssistantWindow.classList.remove('open');
  codesContentAssistantWindow.classList.remove('open');
}

// Mark and render init wrap
function addUnsavedMarkAndRenderInitWrap() {
  if(todoWrap.classList.contains('show')) {
    todoSaveBtn.classList.add('unsaved');
    initGroupsTodosObj();
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
  }
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
  }
  else if(e.ctrlKey && e.code === 'KeyP') {
    e.preventDefault();
    toggleAllDashboardItemBtn.click();
  }

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
    if(assistantWrap.classList.contains('show') && !e.shiftKey) {
      e.preventDefault();
      sendPromptBtn.click();
    } else if(todosAssistantWindow.classList.contains('open') && !e.shiftKey) {
      e.preventDefault();
      sendTodosAssistantPromptBtn.click();
    } else if(notesContentAssistantWindow.classList.contains('open') && !e.shiftKey) {
      e.preventDefault();
      sendNotesContentPromptBtn.click();
    } else if(notesAssistantWindow.classList.contains('open') && !e.shiftKey) {
      e.preventDefault();
      sendNotesPromptBtn.click();
    } else if(urlsAssistantWindow.classList.contains('open') && !e.shiftKey) {
      e.preventDefault();
      sendUrlsAssistantPrompt.click();
    } else if(codesAssistantWindow.classList.contains('open') && !e.shiftKey) {
      e.preventDefault();
      sendCodesAssistantPromptBtn.click();
    } else if(codesContentAssistantWindow.classList.contains('open') && !e.shiftKey) {
      e.preventDefault();
      sendCodesContentAssistantPromptBtn.click();
    }

    else if(addTodoForm.classList.contains('show')) todoAddBtn.click();
    else if(addUrlForm.classList.contains('show')) addUrlBtn.click();
    else if(addNotesForm.classList.contains('show')) addNotesButton.click();
    else if(addCodeBlockForm.classList.contains('show')) addCodeBlockBtn.click();
    else if(editNoteBlock.classList.contains('show')) confNoteEditChangeBtn.click();
  }
})

// Document click event
document.addEventListener('click', e => {
  if(allDashboardItem.classList.contains('open') && !e.target.closest('.all-dashboard-items')) toggleAllDashboardItemBtn.click();
  if(!e.target.closest('.type-assistant') && !e.target.classList.contains('toggle-type-assistant')) closeAllTypeAssistantWindows();

  if(showFieldsBlock.classList.contains('show') && !e.target.closest('.show-fields-block')) showFieldsBlock.classList.remove('show');
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