// Set preloader text
whatIsLoadingText.textContent = 'Loading user code editor...';

const userCodeWrap = document.querySelector('.user-code-wrap');
allDashboardItem.querySelector('.open-user-code-wrap')
.addEventListener('click', () => {
  renderUserCodesBlocks();
  userCodeWrap.classList.add('show');
})
// Close code wrap
userCodeWrap.querySelector('.close-user-code-wrap')
.addEventListener('click', () => {
  userCodeWrap.classList.remove('show');

  for(let block of allUserCodesContainer.children)
    allUserCodesObj[block.firstElementChild.textContent].code = block.querySelector('.user-code-textarea')._editor.getValue();

  showBodyScroll();
});

let allUserCodesObj = {};
// --------------------------------
let hintTimer = null;
let isInitialization = false;

const editorOptions = {
  lineNumbers: true,
  autoCloseBrackets: true,
  foldGutter: true,
  gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
  styleActiveLine: true,
  matchBrackets: true,
  autoCloseTags: true,
  indentUnit: 2,
  tabSize: 2,
}

function createCodeBlock(name) {
  const div = document.createElement('div'),
    h3 = document.createElement('h3'),
    textareaWrap = document.createElement('div'),
    textarea = document.createElement('textarea'),
    hr = document.createElement('hr'),
    button_copyCode = document.createElement('button'),
    button_deleteCode = document.createElement('button'),
    codeSymbolsLimit = document.createElement('p'),
    lockCodeBtn = document.createElement('button'),
    focusCodeBtn = document.createElement('button'),
    codeLangTxt = document.createElement('h6');

  textareaWrap.appendChild(textarea);
  div.append(h3, hr, textareaWrap, button_copyCode, button_deleteCode, focusCodeBtn, codeSymbolsLimit, lockCodeBtn, codeLangTxt);

  div.classList.add('user-code-block');
  if(allUserCodesObj[name].lock) div.style.boxShadow = '0 0 7px 1px gold';

  h3.textContent = name;

  let lang = allUserCodesObj[name].lang.toLowerCase();
  lang = lang == 'html' ? 'htmlmixed' : lang;
  let hintLang = null;
  if (lang === "javascript") hintLang = CodeMirror.hint.javascript;
  else if (lang === "css") hintLang = CodeMirror.hint.css;
  else if (lang === "htmlmixed") hintLang = CodeMirror.hint.html;

  const editor = CodeMirror.fromTextArea(textarea, {
    ...editorOptions,
    mode: lang, hint: hintLang
  });

  isInitialization = true;
  editor.on("inputRead", (cm, change) => {
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => {
      const isUserWrite = change.origin !== 'complete';
      const cursor = cm.getCursor();
      const word = (cm.getLine(cursor.line).slice(0, cursor.ch).match(/[a-z.]+$/i) || '')[0];
      if (isUserWrite && word) cm.showHint({completeSingle: false});
      clearTimeout(hintTimer);
    }, 200);

    const info = cm.getScrollInfo();
    const wrapper = cm.getWrapperElement();
    wrapper.style.height = `${Math.max(60, info.height)}px`;
    div.style.height = div.scrollHeight + 'px';

    const code = cm.getValue();
    const lng = code.replaceAll(" ", "").replaceAll("\n", "").length;

    codeSymbolsLimit.textContent = `${lng}/1500`;
    codeSymbolsLimit.style.color = lng > 1500 ? 'red' : 'white';

    codeSaveBtn.classList.add('unsaved');
  });
  editor.on('beforeChange', (_, change) => {
    if(allUserCodesObj[name].lock && !isInitialization) {
      change.cancel();
      showResponseFn('Your have locked this code');
    };
  })

  editor.setValue(allUserCodesObj[name].code);
  isInitialization = false;

  textarea._editor = editor;
  textarea.classList.add('user-code-textarea');
  textareaWrap.classList.add('user-code-content');

  hr.style.margin = '65px 0 10px 0';

  button_copyCode.classList.add('copy-code-btn');
  button_copyCode.setAttribute('title', 'copy');
  button_copyCode.innerHTML = '<svg><use href="#copy-code"></use></svg>';

  button_deleteCode.classList.add('delete-code-btn');
  button_deleteCode.innerHTML = '<svg> <use href="#delete-code"></use> </svg>';
  button_deleteCode.setAttribute('title', 'delete');

  codeSymbolsLimit.classList.add('code-symbols-limit');
  codeSymbolsLimit.textContent = `${editor.getValue().replaceAll(' ','').replaceAll('\n','').length}/1500`;

  lockCodeBtn.classList.add('lock-code-btn');
  lockCodeBtn.innerHTML = '<svg><use href="#code-block-lock"></use></svg>';
  lockCodeBtn.style.color = allUserCodesObj[name].lock ? 'gold' : 'white';
  lockCodeBtn.setAttribute('title', 'lock');

  focusCodeBtn.classList.add('focus-code-btn');
  focusCodeBtn.innerHTML = '<svg><use href="#focus"></use></svg>';
  focusCodeBtn.setAttribute('title', 'focus');

  codeLangTxt.classList.add('code-lang-text');
  codeLangTxt.textContent = lang === 'htmlmixed' ? 'html' : lang;

  div.style.height = '60px';

  return div;
}

function renderUserCodesBlocks() {
  searchUserCodeInput.value = '';
  allUserCodesContainer.textContent = '';
  const frag = document.createDocumentFragment();

  for(let name in allUserCodesObj) frag.appendChild(createCodeBlock(name));

  // Append fragment
  allUserCodesContainer.appendChild(frag);

  const userCodeBlocksLng = allUserCodesContainer.childElementCount;
  codeBlocksLimitText.textContent = `Codes: ${userCodeBlocksLng}/25`;
  codeProgress.value = userCodeBlocksLng;
}

const addCodeBlockForm = userCodeWrap.querySelector('.add-new-block-code-form');
const codeBlockName = addCodeBlockForm.querySelector('.code-block-name-input');
const codeBlockLang = addCodeBlockForm.querySelector('.user-code-lang');

const addCodeBlockBtn = addCodeBlockForm.querySelector('.add-code-block-btn');
addCodeBlockBtn.addEventListener('click', () => {
  if(Object.keys(allUserCodesObj).length >= 25) return showResponseFn('You have code blocks limit');
  const name = codeBlockName.value.trim();
  if(!name.length) { addCodeBlockForm.classList.remove('show'); return showResponseFn("You don't have a block name")};
  if(allUserCodesObj[name]) return showResponseFn('You used this name');
  if(name.length > 20) return showResponseFn('The name is too long!');
  const lang = codeBlockLang.value;
  if(!lang) return showResponseFn('Please set your code language');

  allUserCodesObj[name] = { code: '', lock: false, lang: lang };

  renderUserCodesBlocks();

  codeBlockName.value = '';
  addCodeBlockForm.classList.remove('show');

  codeSaveBtn.classList.add('unsaved');

  if(allUserCodesContainer.childElementCount >= 25) return toggleAddCodeBlockForm.style.display = 'none';
})

const toggleAddCodeBlockForm = userCodeWrap.querySelector('.toggle-add-new-block-code-form');
toggleAddCodeBlockForm.addEventListener('click', () => {
  if(allUserCodesContainer.childElementCount >= 25) {
    toggleAddCodeBlockForm.style.display = 'none';
    return showResponseFn('You have blocks limit 25/25');
  }
  addCodeBlockForm.classList.toggle('show');
  codeBlockName.focus();
})

// Search user code
const searchUserCodeInput = userCodeWrap.querySelector('.search-code-input');
searchUserCodeInput.addEventListener('input', () => {
  const txt = searchUserCodeInput.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').trim();
  const matchRegexp = new RegExp(txt, 'i');
  const markRegexp = new RegExp(txt, 'gi');

  const allChildren = allUserCodesContainer.children;

  // Reset marks
  for(let block of allChildren) {
    block.firstElementChild.textContent = block.firstElementChild.textContent;
    const codeLengthTxt = block.querySelector('p.code-symbols-limit');
    codeLengthTxt.textContent = codeLengthTxt.textContent;
  };

  if(!txt.length) {
    for(let block of allChildren) block.style.display = 'block';
    return;
  };

  for(let block of allChildren) {
    block.style.display = 'none';
    const name = block.firstElementChild.textContent;
    if(
      name.match(matchRegexp)
      || String(allUserCodesObj[name].code.replaceAll(' ','').replaceAll('\n','').length).includes(txt)
    ) {
      block.style.display = 'block';
      block.firstElementChild.innerHTML = name.replace(markRegexp, '<mark>$&</mark>');
      const codeLengthTxt = block.querySelector('p.code-symbols-limit');
      codeLengthTxt.innerHTML = codeLengthTxt.textContent.replace(markRegexp, '<mark>$&</mark>');
    };
  }
})

// Focus
const focusWrap = userCodeWrap.querySelector('.focus-code-wrap');
const focusCodeTitle = focusWrap.querySelector('.focus-code-title');
const focusCodeSymbols = focusWrap.querySelector('.focus-code-symbols');
const closeFocusBtn = focusWrap.querySelector('.unfocus-btn');
const focusLockCodeBtn = focusWrap.querySelector('.lock');
const focusCodeEditor = CodeMirror.fromTextArea(focusWrap.querySelector('.focus-textarea'), editorOptions);

focusCodeEditor.on('beforeChange', (_, change) => {
  if(allUserCodesObj[focusWrap.firstElementChild.textContent].lock && !isInitialization) {
    change.cancel();
    return showResponseFn('Your have locked this code');
  }
})
focusCodeEditor.on('inputRead', (cm, change) => {
  clearTimeout(hintTimer);
  hintTimer = setTimeout(() => {
    const isUserWrite = change.origin !== 'complete';
    const cursor = cm.getCursor();
    const word = (cm.getLine(cursor.line).slice(0, cursor.ch).match(/[a-z.]+$/i) || '')[0];
    if(isUserWrite && word) cm.showHint({completeSingle: false});
    clearTimeout(hintTimer);
  }, 200);
})
focusCodeEditor.on('change', () => {
  const valueLng = focusCodeEditor.getValue().replaceAll('\n','').replaceAll(' ','').length;
  focusCodeSymbols.textContent = `${valueLng}/1500`;
  focusCodeSymbols.style.color = valueLng > 1500 ? 'red' : 'white';
})

function focusInit(name, value) {
  isInitialization = true;
  let lang = allUserCodesObj[name].lang.toLowerCase();
  lang = lang === 'html' ? 'htmlmixed' : lang;

  let langHint = null;
  if (lang === "javascript") langHint = CodeMirror.hint.javascript;
  else if (lang === "css") langHint = CodeMirror.hint.css;
  else if (lang === "htmlmixed") langHint = CodeMirror.hint.html;

  focusCodeEditor.setOption('hint', langHint);
  focusCodeEditor.setOption('mode', lang);

  focusWrap.classList.add('show');
  focusCodeTitle.textContent = name;
  focusCodeEditor.setValue(value);
  focusCodeEditor.refresh();
  focusCodeSymbols.textContent = `${value.replaceAll('\n','').replaceAll(' ','').length}/1500`;
  isInitialization = false;
}

focusWrap.addEventListener('click', e => {
  const initTarget = e.target;
  if(initTarget.closest('.unfocus-btn')) { // Close focus wrap
    const codeName = focusWrap.firstElementChild.textContent;

    if(focusCodeEditor.getValue() === userCode && allUserCodesObj[codeName].lock === isLockBeforeFocus) return focusWrap.classList.remove('show');

    allUserCodesObj[codeName].code = focusCodeEditor.getValue();
    renderUserCodesBlocks();
    focusWrap.classList.remove('show');
    codeSaveBtn.classList.add('unsaved');
  }
  else if(initTarget.closest('.copy')) { // Copy focus code
    navigator.clipboard.writeText(focusCodeEditor.getValue());
    showResponseFn('Code copied!');
  }
  else if(initTarget.closest('.delete')) { // Delete code block(focus)
    if(!confirm('Delete code?')) return;

    delete allUserCodesObj[focusWrap.firstElementChild.textContent];
    renderUserCodesBlocks();
    showResponseFn(`Block been deleted`)
    focusWrap.classList.remove('show');
    codeSaveBtn.classList.add('unsaved');
  }
  else if(initTarget.closest('.lock')) { // Lock focus code
    const codeName = focusWrap.firstElementChild.textContent;
    allUserCodesObj[codeName].lock =
      !allUserCodesObj[codeName].lock;
    focusWrap.style.boxShadow = allUserCodesObj[codeName].lock ?
    '0 0 5px 1px gold inset' : '0 0 0 0 gold';
    initTarget.closest('.lock').style.color = allUserCodesObj[codeName].lock ?
    'gold' : 'white';
  }
})

// All user code container
let deleteTimer = null;
let userCode = null;
let isLockBeforeFocus = false;
const allUserCodesContainer = userCodeWrap.querySelector('.all-user-codes-container');
allUserCodesContainer.addEventListener('click', e => {
  const targetBlock = e.target.closest('.user-code-block');
  if(e.target.closest('.delete-code-btn')) { // Delete code
    if(allUserCodesObj[targetBlock.firstElementChild.textContent].lock) return showResponseFn('You have locked this code');
    if(localStorage.getItem('conf-before-delete') == 'true' && !confirm('Delete?')) return;

    delete allUserCodesObj[targetBlock.firstElementChild.textContent];
    codeSaveBtn.classList.add('unsaved');

    if(localStorage.getItem('disabled-anim') === 'true') return renderUserCodesBlocks();

    targetBlock.classList.add('del-anim');

    clearTimeout(deleteTimer);
    deleteTimer = setTimeout(() => renderUserCodesBlocks(), delAnimTime);
    return;
  }
  else if(e.target.closest('.lock-code-btn')) { // Lock code
    const initialBtn = e.target.closest('.lock-code-btn');
    allUserCodesObj[targetBlock.firstElementChild.textContent].lock =
    !allUserCodesObj[targetBlock.firstElementChild.textContent].lock;

    if(allUserCodesObj[targetBlock.firstElementChild.textContent].lock) {
      targetBlock.style.boxShadow = '0 0 7px 1px gold';
      initialBtn.style.color = 'gold';
    }
    else {
      targetBlock.style.boxShadow = '0 0 0 0';
      initialBtn.style.color = 'white';
    }
    return codeSaveBtn.classList.add('unsaved');
  }
  else if(e.target.closest('.copy-code-btn')) { // Copy code
    navigator.clipboard.writeText(targetBlock.querySelector('textarea')._editor.getValue());
    return showResponseFn('Code copied!');
  }
  else if(e.target.closest('.focus-code-btn')) { // Open focus code wrap
    const codeName = targetBlock.firstElementChild.textContent;
    focusWrap.style.boxShadow = allUserCodesObj[codeName].lock ?
    '0 0 5px 1px gold inset' : '0 0 0 0 gold';
    focusLockCodeBtn.style.color = allUserCodesObj[codeName].lock ? 'gold' : 'white';

    userCode = targetBlock.querySelector('textarea')._editor.getValue();
    isLockBeforeFocus = allUserCodesObj[codeName].lock;

    return focusInit(
      targetBlock.firstElementChild.textContent,
      targetBlock.querySelector('textarea')._editor.getValue()
    );
  }
  else if(e.target.closest('.user-code-content')) return;

  for(let child of allUserCodesContainer.children) child.style.height = '60px';
  if(targetBlock) { // Open code block
    const wrapper = targetBlock.querySelector('.CodeMirror');
    const editor = targetBlock.querySelector('textarea')._editor;
    editor.refresh();
    const info = editor.getScrollInfo();

    if(!editor.getValue()) {
      wrapper.style.height = '60px';
      editor.setValue('\n')
    } else wrapper.style.height = `${info.height}px`;

    targetBlock.style.height = `${targetBlock.scrollHeight}px`;

    wrapper.scrollTop = 0;
  }
})

// Code-progress and code-blocks-limit
const codeProgress = userCodeWrap.querySelector('.code-progress');
const codeBlocksLimitText = userCodeWrap.querySelector('.code-blocks-limit');

// Code snippets
let favoriteSnippets = JSON.parse(localStorage.getItem('favorite-snippets') || "[]");

const codeSnippetsBlock = userCodeWrap.querySelector('.code-snippets-block');
codeSnippetsBlock.addEventListener('click', e => {
  if(e.target.classList.contains('close-code-snippets-btn')) codeSnippetsBlock.classList.remove('show');
  else if(e.target.closest('.copy-code-snippet')) {
    navigator.clipboard.writeText(
      e.target.closest('.copy-code-snippet')
      .parentElement
      .querySelector('pre')
      .textContent
    );
    showResponseFn('Code copied!');
  }
  else if(e.target.closest('.snippet-fav-btn')) {
    const name = e.target.closest('.snippet-fav-btn').parentElement.firstElementChild.textContent;
    if(favoriteSnippets.includes(name)) favoriteSnippets = favoriteSnippets.filter(snName => snName !== name);
    else favoriteSnippets.push(name);
    renderCodeSnippets();
    searchSnippetsInput.value = '';

    localStorage.setItem('favorite-snippets', JSON.stringify(favoriteSnippets));
  }
})

const codeSnippetsContainer = codeSnippetsBlock.querySelector('.code-snippets-container');

function createSnippetBlock(t, isFavorite) {
  const div = document.createElement('div'),
    title = document.createElement('h3'),
    code = document.createElement('pre'),
    copy = document.createElement('button'),
    favBtn = document.createElement('button');

  div.classList.add('snippet-block');

  title.textContent = t;

  code.textContent = codeSnippetsBlocksInfo[t];
  copy.innerHTML = '<svg><use href="#copy-code"></use></svg>';
  copy.classList.add('copy-code-snippet');

  favBtn.innerHTML = '<svg><use href="#favorite-icon"></use></svg>';
  favBtn.classList.add('snippet-fav-btn');
  favBtn.style.color = isFavorite ? 'yellow' : 'var(--text-color)';

  div.append(title, code, favBtn, copy);
  return div;
}

function renderCodeSnippets() {
  codeSnippetsContainer.textContent = '';
  const frag = document.createDocumentFragment();

  // Render favorite snippets
  for(let t of favoriteSnippets) frag.appendChild(createSnippetBlock(t, true));
  // Render no favorite snippets
  for(let t in codeSnippetsBlocksInfo) if(!favoriteSnippets.includes(t)) frag.appendChild(createSnippetBlock(t, false));
  // Append fragment
  codeSnippetsContainer.appendChild(frag);
}

// Open code snippets
userCodeWrap.querySelector('.open-code-snippets-btn')
.addEventListener('click', () => {
  renderCodeSnippets();
  codeSnippetsBlock.classList.add('show');
  searchSnippetsInput.value = '';
})

// Search snippets
const searchSnippetsInput = codeSnippetsBlock.querySelector('.search-snippets-input');
searchSnippetsInput.addEventListener('input', () => {
  const val = searchSnippetsInput.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').trim();
  if(!val) return renderCodeSnippets();
  const matchRegexp = new RegExp(val, 'i');
  const regex = new RegExp(val, 'gi');

  codeSnippetsContainer.textContent = '';
  const frag = document.createDocumentFragment();

  for(let t in codeSnippetsBlocksInfo) {
    if(t.match(matchRegexp) || codeSnippetsBlocksInfo[t].match(matchRegexp)) {
      const div = document.createElement('div'),
        h3 = document.createElement('h3'),
        pre = document.createElement('pre'),
        copy = document.createElement('button');

      div.classList.add('snippet-block');
      copy.classList.add('copy-code-snippet');
      h3.innerHTML = t.replaceAll(regex, '<mark>$&</mark>');
      copy.innerHTML = '<svg><use href="#copy-code"></use></svg>';
      pre.innerHTML = codeSnippetsBlocksInfo[t].replaceAll(regex, '<mark>$&</mark>');

      div.append(h3, pre, copy);
      frag.appendChild(div);
    }
  }
  // Append fragment
  codeSnippetsContainer.appendChild(frag);

  if(!codeSnippetsContainer.childElementCount) showResponseFn('Snippets not found');
})

// Set preloader value
preloaderProgress.value = 5;