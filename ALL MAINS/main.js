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
    allDashboardItem.querySelector('button.active-btn')?.classList.remove('active-btn'); // Remove active-btn class

    // Types
    if(todoWrap.classList.contains('show')) openTodoWrapBtn.classList.add('active-btn');
    else if(notesWrap.classList.contains('show')) openNoteWrapBtn.classList.add('active-btn');
    else if(urlsWrap.classList.contains('show')) openUrlWrapBtn.classList.add('active-btn');
    else if(userCodeWrap.classList.contains('show')) openCodeWrapBtn.classList.add('active-btn');
    else if(textsSnippetsWrap.classList.contains('show')) openTextsSnippetsWrap.classList.add('active-btn');
    else if(musicWrap.classList.contains('show')) openMusicWrapBtn.classList.add('active-btn');

    // Services
    else if(exchangeRateWrap.classList.contains('show')) openExchangeRateWrapBtn.classList.add('active-btn');
    else if(weatherWrap.classList.contains('show')) openWeatherWrapBtn.classList.add('active-btn');
    else if(timezoneWrap.classList.contains('show')) openTimezoneWrapBtn.classList.add('active-btn');
    else if(assistantWrap.classList.contains('show')) openAssistantWrapBtn.classList.add('active-btn');
    else if(githubWrap.classList.contains('show')) openGithubWrapBtn.classList.add('active-btn');
    else if(generateImageWrap.classList.contains('show')) openGenerateImgWrapBtn.classList.add('active-btn');
    else if(textWorkerServiceWrap.classList.contains('show')) openTextWorkerServiceBtn.classList.add('active-btn');
    else if(qrCodeGenerationWrap.classList.contains('show')) openQrCodeGenerationBtn.classList.add('active-btn');
    else if(browserWorkerWrap.classList.contains('show')) openBrowserWorkerBtn.classList.add('active-btn');
    else if(regexpCheckerWrap.classList.contains('show')) openRegexpCheckerBtn.classList.add('active-btn');
    else if(wikipediaWrap.classList.contains('show')) openWikipediaBtn.classList.add('active-btn');
    else if(ipSearchWrap.classList.contains('show')) openIpSearchBtn.classList.add('active-btn');
    else if(jsonWorkerWrap.classList.contains('show')) openJsonWorkerBtn.classList.add('active-btn');
    else if(reasoningAiWrap.classList.contains('show')) openReasoningAiBtn.classList.add('active-btn');
    else if(tempAiWrap.classList.contains('show')) openTempAiBtn.classList.add('active-btn');
    else if(fetchServiceWrap.classList.contains('show')) openFetchServiceBtn.classList.add('active-btn');
    else if(mediaSearchWrap.classList.contains('show')) openMediaSearchBtn.classList.add('active-btn');
    else if(unitConverterWrap.classList.contains('show')) openUnitConverterBtn.classList.add('active-btn');
    else if(textToSpeechWrap.classList.contains('show')) openTextToSpeechBtn.classList.add('active-btn');
    else if(diffTextWrap.classList.contains('show')) openDiffTextBtn.classList.add('active-btn');
    else if(csvRenderWrap.classList.contains('show')) openCsvRenderBtn.classList.add('active-btn');
    else if(imageCompressWrap.classList.contains('show')) openImageCompressBtn.classList.add('active-btn');
    else if(tokenCounterWrap.classList.contains('show')) openTokenCounterBtn.classList.add('active-btn');
    else if(colorWorkerWrap.classList.contains('show')) openColorWorkerBtn.classList.add('active-btn');
    else if(filesInfoWrap.classList.contains('show')) openFilesInfoBtn.classList.add('active-btn');
    else if(substringsSearchWrap.classList.contains('show')) openSubstringsSearchBtn.classList.add('active-btn');
    else if(codeAiWrap.classList.contains('show')) openCodeAiBtn.classList.add('active-btn');
    else if(ideaGeneratorWrap.classList.contains('show')) openIdeaGeneratorBtn.classList.add('active-btn');
    else if(miniCaniuseWrap.classList.contains('show')) openMiniCaniuseBtn.classList.add('active-btn');
    else if(distanceServiceWrap.classList.contains('show')) openDistanceServiceBtn.classList.add('active-btn');
    else if(asciiWorkerWrap.classList.contains('show')) openAsciiWorkerBtn.classList.add('active-btn');
    else if(languageLearnWrap.classList.contains('show')) openLanguageLearnBtn.classList.add('active-btn');
    else if(mathGameWrap.classList.contains('show')) openMathGameBtn.classList.add('active-btn');
    else if(debateWithAiWrap.classList.contains('show')) openDebateWithAiBtn.classList.add('active-btn');

    else if(settingsWrap.classList.contains('show')) openSettingsWrapBtn.classList.add('active-btn');
    else if(commandRunnerWrap.classList.contains('show')) openCommandRunnerWrapBtn.classList.add('active-btn');
  }
})

const tagUseInToggleSidebarBtn = toggleAllDashboardItemBtn.querySelector('use');

// Close all wraps
function closeAllWraps() {
  for(const wrap of document.querySelectorAll('.is-wrap.show:not(.learn-settings)')) wrap.classList.remove('show');

  undoLastActionBlock.classList.remove('show');
  lastDataForUndoAction = null;

  if(allDashboardItem.classList.contains('open')) toggleAllDashboardItemBtn.click();
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
  ?.replaceAll("&#39;", "'")
  ?.replaceAll('&amp;', '&');
}

// Render markdown
const latexReplacements = {
  '\\%': '%',
  '\\approx': '≈',
  '\\neq': '≠',
  '\\le': '≤',
  '\\ge': '≥',
  '\\to': '→',
  '\\times': '×',
  '\\alpha': 'α',
  '\\beta': 'β',
  '\\gamma': 'γ',
  '\\delta': 'δ',
  '\\pi': 'π',
  '\\lambda': 'λ',
  '\\mu': 'μ',
  '\\sigma': 'σ',
  '\\omega': 'ω',
  '\\infty': '∞',
  '\\sum': '∑',
  '\\prod': '∏',
  '\\sqrt': '√',
  '\\degree': '°',
  '\\rightarrow': '→',
  '\\leftarrow': '←',
  '\\leftrightarrow': '↔',
  '\\Rightarrow': '⇒',
  '\\Leftarrow': '⇐',
  '\\Leftrightarrow': '⇔',
  '\\uparrow': '↑',
  '\\downarrow': '↓',
  '\\nearrow': '↗',
  '\\searrow': '↘',
  '\\swarrow': '↙',
  '\\nwarrow': '↖',
  '\\land': '∧',
  '\\lor': '∨',
  '\\neg': '¬',
  '\\forall': '∀',
  '\\exists': '∃',
  '\\in': '∈',
  '\\notin': '∉',
  '\\subset': '⊂',
  '\\subseteq': '⊆',
  '\\cup': '∪',
  '\\cap': '∩',
  '\\vdash': '⊢',
  '\\models': '⊨',
  '\\cdot': '·',
  '\\pm': '±',
  '\\oplus': '⊕',
  '\\otimes': '⊗',
  '\\implies': '⇒',
  '\\iff': '⇔',
  '\\ ': '&nbsp;'
};

const latexRegexp = new RegExp(
  Object.keys(latexReplacements)
    .sort((a, b) => b.length - a.length)
    .map(x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|'),
  'g'
);

// Render markdown
function renderMarkdown(message) {
  const codeBlocks = [];
  const inlineCodeBlocks = [];

  let txt = hashHtmlSymbols(message)
    ?.replace(/```([^\n]*)\n([\s\S]*?)```/g, (m, lang, code) => {
      const id = codeBlocks.length;
      codeBlocks.push(`<div class="code-block" data-title="${lang}">
    <pre><code>${code}</code></pre>
  </div>`);
      return `@@CODEBLOCK${id}@@`;
    })
    .replace(/(?<!`)`(?!`)(.+?)(?<!`)`(?!`)/g, (m, code) => {
      const id = inlineCodeBlocks.length;

      inlineCodeBlocks.push(`<code class="inline-code">${code}</code>`);

      return `@@INLINECODE${id}@@`;
    })
    .replace(/\$O\((.*?)\)\$/g, (_, content) =>
      `O(${content.replace(/\\log\b/g, 'log')})`
    )
    .replace(/^(#{1,6}) *(.+)$/gm, (_, tag, txt) => `<h${tag.length}>${txt}</h${tag.length}>`)
    .replace(/^\s*\-\-\-|^\s*\*\*\*/gm, '<hr>')
    .replace(/\$(.*?)\$/g, '$1')
    .replace(
      /(\*{1,3})([^ ][^*]+?)\1/g,
      (_, marks, content) => {
        if (marks === '***') return `<strong><em>${content}</em></strong>`;
        if (marks === '**') return `<strong>${content}</strong>`;
        return `<em>${content}</em>`;
      }
    )
    .replace(/_(\d+)/g, '<sub>$1</sub>')
    .replace(/(^|\s)_(.+?)_(?=\s|$)/g, '$1<em>$2</em>')
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    .replace(/\$?\\boxed\{([\s\S]*?)\}\$?/g,
      (_, content) => {
        return `<span style="
      border:1px solid #666;
      border-radius:6px;
      padding:2px 6px;
      display:inline-block;
      font-weight:600;
    ">${content}</span>`
      }
    ).replace(/\\text\{(.*?)\}/g, '$1')
    .replace(latexRegexp, match => latexReplacements[match])
    .replace(/\^(\d+)/g, '<sup>$1</sup>')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '<span class="frac"><span>$1</span><hr><span>$2</span></span>')?.replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    .replace(/^>[ ]?(.+)/gm, '<blockquote>$1</blockquote>')
    .replace(/@@CODEBLOCK(\d+)@@/g, (all, i) => codeBlocks[i] ?? all)
    .replace(/@@INLINECODE(\d+)@@/g, (all, i) => inlineCodeBlocks[i] ?? all);

  // Add lists
  if (txt) {
    const ulBlocks = txt.match(/(\n *[-*][^\n]+)+/g);
    if (ulBlocks) for (let ulBlock of ulBlocks) {
      let str = ulBlock;

      for (let liTxt of str.match(/\n *[-*][^\n]+/g)) {
        const spacesNum = liTxt.search(/[-*]/);
        str = str.replace(liTxt, `<li style="margin-left: ${spacesNum * 8}px;">${liTxt.trim().replace('\n', '').replace(/[-*]/, '')}</li>`);
      };

      str = `\n<ul>${str}</ul>\n`;

      txt = txt.replace(ulBlock, str);
    }
  }

  // Add tables
  if (txt) {
    // Ловимо блок таблиці (кілька рядків що починаються з |)
    const tableBlocks = txt.match(/(\|[^\n]+\|\n?)+/g);

    if (tableBlocks) for (let tableBlock of tableBlocks) {
      const rows = tableBlock.trim().split('\n');
      let html = '<table>';

      rows.forEach((row, index) => {
        // Пропускаємо роздільник |---|---|
        if (/^\|[-| :]+\|$/.test(row.trim())) return;

        const cells = row
          .split('|')
          .filter(c => c.trim() !== ''); // прибираємо порожні з країв

        if (index === 0) {
          // Перший рядок = thead
          html += '<thead><tr>';
          cells.forEach(c => html += `<th>${c.trim()}</th>`);
          html += '</tr></thead><tbody>';
        } else {
          // Решта = tbody
          html += '<tr>';
          cells.forEach(c => html += `<td>${c.trim()}</td>`);
          html += '</tr>';
        }
      });

      html += '</tbody></table>';
      txt = txt.replace(tableBlock, unhashHtmlSymbols(html));
    }
  }

  return txt;
}

// Load script
const header = document.querySelector('header');
async function loadScript(src) {
  await new Promise((res, rej) => {
    const script = document.createElement('script');
    script.src = src;
    header.appendChild(script);
    script.onload = () => res();
    script.onerror = () => rej(new Error('Script failed to load'));
  })
  return 'Done';
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
let isJson5Loaded = false;
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

// Key... event
document.addEventListener('keydown', e => {
  if(e.ctrlKey && e.code === 'KeyH') {
    e.preventDefault();
    if(notesWrap.classList.contains('show')) openAddNoteForm.click();
    else if(userCodeWrap.classList.contains('show')) toggleAddCodeBlockForm.click();
    else if(urlsWrap.classList.contains('show')) toggleUrlFormBtn.click();
    else if(todoWrap.classList.contains('show')) toggleAddTodoForm.click();
    else if(textsSnippetsWrap.classList.contains('show')) toggleAddTextSnippetForm.click();
    else if(musicWrap.classList.contains('show')) toggleAddMusicFormBtn.click();
  }
  // Open side panel
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
    if(assistantWrap.classList.contains('show') && !e.shiftKey) {
      e.preventDefault();
      sendPromptBtn.click();
    }

    else if(addTodoForm.classList.contains('show')) todoAddBtn.click();
    else if(addUrlForm.classList.contains('show')) addUrlBtn.click();
    else if(addNotesForm.classList.contains('show')) addNotesButton.click();
    else if(addCodeBlockForm.classList.contains('show')) addCodeBlockBtn.click();
    else if(editNoteBlock.classList.contains('show')) confNoteEditChangeBtn.click();
    else if(addMusicForm.classList.contains('show')) addMusicBtn.click();

    // Services
    else if(githubWrap.classList.contains('show')) searchGithubUserBtn.click();
    else if(generateImageWrap.classList.contains('show')) sendPromptForGenerateImgBtn.click();
    else if(browserWorkerWrap.classList.contains('show')) setBrowserWorkerBtn.click();
    else if(ipSearchWrap.classList.contains('show')) searchIpBtn.click();
    else if(mediaSearchWrap.classList.contains('show')) searchMediaBtn.click();
    else if(guessingWrap.classList.contains('show')) guessingSendBtn.click();
  }
})

// Document click event
document.addEventListener('click', e => {
  if(allDashboardItem.classList.contains('open') && !e.target.closest('.all-dashboard-items')) toggleAllDashboardItemBtn.click();

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

  if(type === 'todo') {
    allTodosObj = lastDataForUndoAction.content;
    todoSaveBtn.classList.toggle('unsaved', lastDataForUndoAction.isSaved);
    renderTodos();
  }
  else if(type === 'note') {
    allNotesObj = lastDataForUndoAction.content;
    noteSaveBtn.classList.toggle('unsaved', lastDataForUndoAction.isSaved);
    renderNotesBlocks();
  }
  else if(type === 'url') {
    allUrlsObj = lastDataForUndoAction.content;
    urlSaveBtn.classList.toggle('unsaved', lastDataForUndoAction.isSaved);
    renderAllUrls();
  }
  else if(type === 'code') {
    allUserCodesObj = lastDataForUndoAction.content;
    codeSaveBtn.classList.toggle('unsaved', lastDataForUndoAction.isSaved);
    renderUserCodesBlocks();
  }
  else if(type === 'text') {
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
  let saveBtn = type === 'todo' ? todoSaveBtn : type === 'note' ? noteSaveBtn : type === 'url' ? urlSaveBtn : type === 'code' ? codeSaveBtn : type === 'text' ? textSaveBtn : musicSaveBtn;
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

// Image compress
let imgCompressLoaded = false;
const compressImgOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 800,
  fileType: 'image/webp',
  initialQuality: 1,
  useWebWorker: true
};

// Init window state
function setInitWindowState() {
  const hash = location.hash?.slice(1);
  if(dashboardWindowsBtnsFromNames[hash]) dashboardWindowsBtnsFromNames[hash].click();
}
window.addEventListener('popstate', () => setInitWindowState());

// Set preloader value
preloaderProgress.value = 1;