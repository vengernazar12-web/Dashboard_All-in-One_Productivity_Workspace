const userCodeWrap = document.querySelector('.user-code-wrap');
userCodeWrap.addEventListener('click', e => {
  if(!e.target.classList.contains('toggle-add-new-block-code-form') && !e.target.closest('.add-new-block-code-form')) addCodeBlockForm.classList.remove('show');
})
// Open
const openCodeWrapBtn = allDashboardItem.querySelector('.open-user-code-wrap');
openCodeWrapBtn.addEventListener('click', async () => {
  closeAllWraps();
  if(needPushState) history.pushState({}, null, '#codes');

  if(!codeMirrorLoaded || !allUserCodesObj) {
    preloaderProgress.max = 1;
    preloaderProgress.value = 0;
    showPreloader();
    whatIsLoadingText.textContent = 'Start...';
  }

  if(!codeMirrorLoaded) {
    await loadCodemirror();

    focusCodeEditor = CodeMirror.fromTextArea(focusWrap.querySelector('.focus-textarea'), editorOptions);

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
      const valueLng = focusCodeEditor.getValue().replace(/\s/g,'').length;
      focusCodeSymbols.textContent = `${valueLng}/${allValuesLimit.codeContent}`;
      focusCodeSymbols.style.color = valueLng > allValuesLimit.codeContent ? 'red' : 'white';
    })
  };

  if(!allUserCodesObj) allUserCodesObj = await getContent('codes') || {};

  renderUserCodesBlocks();

  userCodeWrap.classList.add('show');

  if(preloaderWrap.classList.contains('show')) {
    preloaderProgress.value = 1;
    whatIsLoadingText.textContent = 'Loaded';
    setTimeout(() => showPreloader(false), 500);
  }
})

let allUserCodesObj = null;
// --------------------------------
let hintTimer = null;
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
    focusCodeBtn = document.createElement('button'),
    codeLangTxt = document.createElement('h6');

  textareaWrap.appendChild(textarea);
  div.append(h3, hr, textareaWrap, button_copyCode, button_deleteCode, focusCodeBtn, codeSymbolsLimit, codeLangTxt);

  div.dataset.name = name;
  div.classList.add('user-code-block');

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

  editor.on("inputRead", (cm, change) => {
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => {
      const isUserWrite = change.origin !== 'complete';
      const cursor = cm.getCursor();
      const word = (cm.getLine(cursor.line).slice(0, cursor.ch).match(/[a-z.]+$/i) || '')[0];
      if (isUserWrite && word) cm.showHint({completeSingle: false});
      clearTimeout(hintTimer);
    }, 200);

    const code = cm.getValue();
    const lng = code.replace(/\s/g, "").length;

    codeSymbolsLimit.textContent = `${lng}/${allValuesLimit.codeContent}`;
    codeSymbolsLimit.style.color = lng > allValuesLimit.codeContent ? 'red' : 'white';

    codeSaveBtn.classList.add('unsaved');
  });
  editor.on('change', (cm) => {
    const info = cm.getScrollInfo();
    const wrapper = cm.getWrapperElement();
    wrapper.style.height = `${info.height}px`;
    wrapper.scrollTop = info.height;
    div.style.height = `${div.scrollHeight}px`;
  })

  editor.setValue(allUserCodesObj[name].code);

  textarea._editor = editor;
  textarea.classList.add('user-code-textarea');
  textareaWrap.classList.add('user-code-content');

  hr.style.margin = '65px 0 10px 0';

  button_copyCode.classList.add('copy-code-btn');
  button_copyCode.setAttribute('title', 'copy');
  button_copyCode.innerHTML = '<svg><use href="#copy-code"></use></svg>';

  button_deleteCode.classList.add('delete-code-btn');
  button_deleteCode.innerHTML = '<svg><use href="#delete-code"></use></svg>';
  button_deleteCode.setAttribute('title', 'delete');

  codeSymbolsLimit.classList.add('code-symbols-limit');
  codeSymbolsLimit.textContent = `${editor.getValue().replace(/\s/g,'').length}/${allValuesLimit.codeContent}`;

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

  const userCodeBlocksLng = Object.keys(allUserCodesObj).length;
  codeBlocksLimitText.textContent = `Codes: ${userCodeBlocksLng}/${allBlockLimitsObj.codes}`;
  codeProgress.value = userCodeBlocksLng;
}

const addCodeBlockForm = userCodeWrap.querySelector('.add-new-block-code-form');

const codeBlockName = addCodeBlockForm.querySelector('.code-block-name-input');
codeBlockName.addEventListener('input', () => renderShowFieldsBlock(Object.keys(allUserCodesObj), codeBlockName.value.trim(), codeBlockName, true));

const codeBlockLang = addCodeBlockForm.querySelector('.user-code-lang');

// Add code block
const toggleAddCodeBlockForm = userCodeWrap.querySelector('.toggle-add-new-block-code-form');
toggleAddCodeBlockForm.addEventListener('click', () => {
  addCodeBlockForm.classList.toggle('show');
  codeBlockName.focus();
})

const addCodeBlockBtn = addCodeBlockForm.querySelector('.add-code-block-btn');
addCodeBlockBtn.addEventListener('click', () => {
  if(Object.keys(allUserCodesObj).length >= allBlockLimitsObj.codes) return showResponseFn('You have code blocks limit');
  const name = codeBlockName.value.trim();
  if(!name.length) { addCodeBlockForm.classList.remove('show'); return showResponseFn("You don't have a block name")};
  if(allUserCodesObj[name]) return showResponseFn('You used this name');
  if(name.length > allValuesLimit.codeName) return showResponseFn('The name is too long!');
  const lang = codeBlockLang.value;
  if(!lang) return showResponseFn('Please set your code language');

  initUndoActionBlock('codes', allUserCodesObj);

  allUserCodesObj[name] = { code: '', lang };

  renderUserCodesBlocks();

  codeBlockName.value = '';
  addCodeBlockForm.classList.remove('show');

  codeSaveBtn.classList.add('unsaved');
})

// Search user code
const searchUserCodeInput = userCodeWrap.querySelector('.search-code-input');
searchUserCodeInput.addEventListener('input', () => {
  const txt = hashHtmlSymbols(searchUserCodeInput.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').trim());
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
    const name = hashHtmlSymbols(block.firstElementChild.textContent);
    if(
      name.match(markRegexp)
      || String(allUserCodesObj[name].code.replace(/\s/g,'').length).includes(txt)
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
let focusCodeEditor = null;

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
  focusCodeSymbols.textContent = `${value.replace(/\s/g,'').length}/${allValuesLimit.codeContent}`;
  isInitialization = false;
}

focusWrap.addEventListener('click', e => {
  const initTarget = e.target;
  if(initTarget.closest('.unfocus-btn')) { // Close focus wrap
    const codeName = focusWrap.firstElementChild.textContent;

    if(focusCodeEditor.getValue() === userCode) return focusWrap.classList.remove('show');

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
  // Toggle codes content assistant(focus)
  else if(initTarget.classList.contains('toggle-codes-content-assistant-window')) codesContentAssistantWindow.classList.toggle('open');
})

// All user code container
let deleteTimer = null;
let userCode = null;
const allUserCodesContainer = userCodeWrap.querySelector('.all-user-codes-container');
allUserCodesContainer.addEventListener('click', e => {
  const targetBlock = e.target.closest('.user-code-block');
  if(e.target.closest('.delete-code-btn')) { // Delete code
    const name = targetBlock.firstElementChild.textContent;
    if(localStorage.getItem('conf-before-delete') == 'true' && !confirm('Delete?')) return;

    initUndoActionBlock('codes', allUserCodesObj);

    delete allUserCodesObj[name];
    codeSaveBtn.classList.add('unsaved');

    if(localStorage.getItem('disabled-anim') === 'true') return renderUserCodesBlocks();

    targetBlock.classList.add('del-anim');

    clearTimeout(deleteTimer);
    deleteTimer = setTimeout(() => renderUserCodesBlocks(), delAnimTime);

    return;
  }
  else if(e.target.closest('.copy-code-btn')) { // Copy code
    navigator.clipboard.writeText(targetBlock.querySelector('textarea')._editor.getValue());
    return showResponseFn('Code copied!');
  }
  else if(e.target.closest('.focus-code-btn')) { // Open focus code wrap
    userCode = targetBlock.querySelector('textarea')._editor.getValue();

    return focusInit(
      targetBlock.firstElementChild.textContent,
      targetBlock.querySelector('textarea')._editor.getValue()
    );
  }
  else if(e.target.closest('.user-code-content')) return;

  for(let child of allUserCodesContainer.children) child.style.height = '60px';
  if(targetBlock) { // Open code block
    const editor = targetBlock.querySelector('textarea')._editor;
    const wrapper = editor.getWrapperElement();
    editor.refresh();
    const info = editor.getScrollInfo();

    if(!editor.getValue()) {
      wrapper.style.height = '60px';
      editor.setValue('\n');
    } else wrapper.style.height = `${info.height}px`;

    targetBlock.style.height = `${targetBlock.scrollHeight}px`;
  }
})

// Code-progress and code-blocks-limit
const codeProgress = userCodeWrap.querySelector('.code-progress');
const codeBlocksLimitText = userCodeWrap.querySelector('.code-blocks-limit');