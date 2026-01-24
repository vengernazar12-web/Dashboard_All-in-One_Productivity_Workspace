const userCodeWrap = document.querySelector('.user-code-wrap');
document.querySelector('.open-user-code-wrap')
.addEventListener('click', () => {
  renderUserCodesBlocks();
  userCodeWrap.classList.add('show');
  const codesBlocksLng = Object.keys(allUserCodesObj).length;
  codeBlocksLimitText.textContent = `Codes: ${codesBlocksLng}/15`;
  codeProgress.value = codesBlocksLng;
})
userCodeWrap.querySelector('.close-user-code-wrap')
.addEventListener('click', () => userCodeWrap.classList.remove('show'));

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
  textarea.spellcheck = false;


  textareaWrap.classList.add('user-code-content');

  hr.style.margin = '65px 0 10px 0';

  button_copyCode.classList.add('copy-code-btn');
  button_copyCode.setAttribute('title', 'copy');
  button_copyCode.innerHTML = '<svg><use href="sprite.svg#copy-code"></use></svg>';

  button_deleteCode.classList.add('delete-code-btn');
  button_deleteCode.innerHTML = '<svg><use href="sprite.svg#delete-code"></use></svg>';
  button_deleteCode.setAttribute('title', 'delete');

  codeSymbolsLimit.classList.add('code-symbols-limit');
  codeSymbolsLimit.textContent = `${editor.getValue().replaceAll(' ','').replaceAll('\n','').length}/1500`;

  lockCodeBtn.classList.add('lock-code-btn');
  lockCodeBtn.innerHTML = '<svg><use href="sprite.svg#code-block-lock"></use></svg>';
  lockCodeBtn.style.color = allUserCodesObj[name].lock ? 'gold' : 'white';
  lockCodeBtn.setAttribute('title', 'lock');

  focusCodeBtn.classList.add('focus-code-btn');
  focusCodeBtn.innerHTML = `
  <svg id="focus" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="3"/>
  <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
  <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
  <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
  <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
  </svg>
  `
  focusCodeBtn.setAttribute('title', 'focus');

  codeLangTxt.classList.add('code-lang-text');
  codeLangTxt.textContent = lang === 'htmlmixed' ? 'html' : lang;

  div.style.height = '60px';
  allUserCodesContainer.appendChild(div);
}

function renderUserCodesBlocks() {
  allUserCodesContainer.textContent = '';
  for(let name of Object.keys(allUserCodesObj)) createCodeBlock(name);
}

const addCodeBlockForm = userCodeWrap.querySelector('.add-new-block-code-form');
const codeBlockName = addCodeBlockForm.querySelector('.code-block-name-input');
const codeBlockLang = addCodeBlockForm.querySelector('.user-code-lang');

const addCodeBlockBtn = addCodeBlockForm.querySelector('.add-code-block-btn');
addCodeBlockBtn.addEventListener('click', () => {
  const codeBlocksLng = Object.keys(allUserCodesObj).length;
  if(codeBlocksLng >= 15) return showResponseFn('You have code blocks limit');
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

  codeBlocksLimitText.textContent = `Codes: ${codeBlocksLng + 1}/15`;
  codeProgress.value = codeBlocksLng + 1;

  if(allUserCodesContainer.childElementCount >= 15) return toggleAddCodeBlockForm.style.display = 'none';
})

const toggleAddCodeBlockForm = userCodeWrap.querySelector('.toggle-add-new-block-code-form');
toggleAddCodeBlockForm.addEventListener('click', () => {
  if(allUserCodesContainer.childElementCount >= 15) {
    toggleAddCodeBlockForm.style.display = 'none';
    return showResponseFn('You have blocks limit 15/15');
  }
  addCodeBlockForm.classList.toggle('show');
  codeBlockName.focus();
})

// Search user code
function renderFoundUserCodes(txt) {
  const allChildren = allUserCodesContainer.children;

  if(!txt.length) {
    for(let block of allChildren) block.style.display = 'block';
    return;
  };

  for(let block of allChildren) {
    block.style.display = 'none';
    const name = block.firstElementChild.textContent.toLowerCase();
    const initialCode = block.querySelector('.user-code-content').value.toLowerCase();
    if(
      name.includes(txt)
      || initialCode.includes(txt)
      || String(initialCode.replaceAll(' ','').replaceAll('\n','').length).includes(txt)
    ) block.style.display = 'block';
  }
}

const searchUserCodeArea = userCodeWrap.querySelector('.search-code-textarea');
searchUserCodeArea.addEventListener('input', () => {
  searchUserCodeArea.style.height = `${searchUserCodeArea.scrollHeight}px`;
  renderFoundUserCodes(searchUserCodeArea.value.trim().toLowerCase());
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
  }, 200)
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
    allUserCodesObj[focusWrap.firstElementChild.textContent].code = focusCodeEditor.getValue();
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
const allUserCodesContainer = userCodeWrap.querySelector('.all-user-codes-container');
allUserCodesContainer.addEventListener('click', e => {
  const targetBlock = e.target.closest('.user-code-block');
  if(e.target.closest('.delete-code-btn')) { // Delete code
    if(allUserCodesObj[targetBlock.firstElementChild.textContent].lock) return showResponseFn('You have locked this code');
    if(!confirm('Delete code?')) return;
    delete allUserCodesObj[targetBlock.firstElementChild.textContent];
    renderUserCodesBlocks();
    codeSaveBtn.classList.add('unsaved');

    const codeBlocksLng = Object.keys(allUserCodesObj).length;
    codeBlocksLimitText.textContent = `Codes: ${codeBlocksLng}/15`;
    codeProgress.value = codeBlocksLng;

    return showResponseFn('Block been deleted');
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