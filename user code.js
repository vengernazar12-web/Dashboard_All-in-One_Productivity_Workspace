/*All ready words*/ const allReadyWords = [
'break','case','catch','class','const','continue','debugger','default',
'delete','do','else','export','extends','finally','for','function',
'if','import','in','instanceof','let','new','return','super','switch',
'this','throw','try','typeof','var','void','while','with','yield',
'Array','Boolean','Date','Error','Function','JSON','Math','Number',
'Object','RegExp','String','Map','Set','WeakMap','WeakSet','Symbol',
'Promise','BigInt','Intl','Reflect','Proxy','console','window','document',
'charAt','charCodeAt','codePointAt','concat','includes','endsWith',
'indexOf','lastIndexOf','localeCompare','match','matchAll','normalize',
'padEnd','padStart','repeat','replace','replaceAll','search','slice',
'split','startsWith','substring','toLocaleLowerCase','toLocaleUpperCase',
'toLowerCase','toUpperCase','trim','trimStart','trimEnd','valueOf',
'appendChild','removeChild','replaceChild','insertBefore','cloneNode',
'getAttribute','setAttribute','removeAttribute','hasAttribute',
'querySelector','querySelectorAll','getElementById','getElementsByClassName',
'getElementsByTagName','addEventListener','removeEventListener','focus',
'blur','scrollIntoView','contains','matches','closest','classList.add',
'classList.remove','classList.toggle','classList.contains','textContent',
'innerHTML','innerText','value',
'alert','prompt','confirm','setTimeout','setInterval','clearTimeout',
'clearInterval','fetch','localStorage','sessionStorage','JSON.stringify',
'JSON.parse','Date.now','Math.random','Math.floor','Math.ceil','Math.round',
'Math.max','Math.min','parseInt','parseFloat','isNaN','isFinite',
'async', 'await', 'yield', 'static', 'get', 'set', 'of', 'constructor', 'super',
'then', 'catch', 'finally', 'resolve', 'reject', 'all', 'race', 'any', 'allSettled',
'findLast','findLastIndex','copyWithin','fill','at','every','some','from','of',
'entries','keys','values','flatMap','flat','includes',
'trimLeft','trimRight','raw','startsWith','endsWith',
'preventDefault','stopPropagation','dispatchEvent','createElement','createTextNode',
'getBoundingClientRect','insertAdjacentHTML','insertAdjacentElement','replaceWith',
'scrollTop','scrollLeft','scrollHeight','scrollWidth','offsetTop','offsetLeft','offsetHeight','offsetWidth',
'encodeURI','decodeURI','encodeURIComponent','decodeURIComponent','escape','unescape',
'isFinite','isInteger','isSafeInteger','parseFloat','parseInt','toString','valueOf','hasOwnProperty','Object.keys','Object.values','Object.entries',
'Math.abs','Math.sign','Math.trunc','Math.cbrt','Math.clz32','Math.imul','Math.log2','Math.log10','Math.exp','Math.expm1','Math.hypot','Math.fround','Math.sinh','Math.cosh','Math.tanh','Math.asinh','Math.acosh','Math.atanh','Math.randomInt',
'onclick','oninput','onchange','onsubmit','onkeydown','onkeyup','onkeypress','onmousedown','onmouseup','onmousemove','onmouseenter','onmouseleave'
]
let allUserCodesObj = {};
// --------------------------------

const getReadyCodeWords = document.querySelector('.give-ready-code-words');
const getReadyCodeWordsBlock = getReadyCodeWords.querySelector('div');

function createCodeBlock(name) {
  const div = document.createElement('div'),
    h3 = document.createElement('h3'),
    textArea = document.createElement('textarea'),
    hr = document.createElement('hr'),
    button_copyCode = document.createElement('button'),
    button_deleteCode = document.createElement('button'),
    codeSymbolsLimit = document.createElement('p'),
    lockCodeBtn = document.createElement('button');

    div.classList.add('user-code-block');
    div.style.position = 'relative';
    if(allUserCodesObj[name].lock) div.style.boxShadow = '0 0 7px 1px gold';

    h3.textContent = name;

    textArea.textContent = allUserCodesObj[name].code;
    textArea.classList.add('user-code-content');
    textArea.style.height = `${textArea.scrollHeight}px`;
    textArea.spellcheck = false;

    hr.style.margin = '65px 0 10px 0';

    button_copyCode.classList.add('copy-code-btn');
    button_copyCode.setAttribute('title', 'copy');
    button_copyCode.innerHTML = '<svg><use href="sprite.svg#copy-code"></use></svg>';

    button_deleteCode.classList.add('delete-code-btn');
    button_deleteCode.innerHTML = '<svg><use href="sprite.svg#delete-code"></use></svg>';
    button_deleteCode.setAttribute('title', 'delete');

    codeSymbolsLimit.classList.add('code-symbols-limit');
    codeSymbolsLimit.textContent = `${textArea.value.replaceAll(' ','').replaceAll('\n','').length}/1500`;

    lockCodeBtn.classList.add('lock-code-btn');
    lockCodeBtn.innerHTML = '<svg><use href="sprite.svg#code-block-lock"></use></svg>';
    lockCodeBtn.style.color = allUserCodesObj[name].lock ? 'gold' : 'white';

    textArea.addEventListener('beforeinput', e => {
      if(allUserCodesObj[name].lock) {
        showResponseFn('You have locked this code');
        return e.preventDefault();
      };
    })
    textArea.addEventListener('input', e => {
      textArea.style.height = `${textArea.scrollHeight}px`;
      div.style.height = `${div.scrollHeight}px`;

      const lng = textArea.value.replaceAll(' ','').replaceAll('\n','').length;
      codeSymbolsLimit.textContent = `${lng}/1500`;
      if(lng > 1500) {
        codeSymbolsLimit.style.color = 'red';
        showResponseFn('Your code is too long');
      }
      else codeSymbolsLimit.style.color = 'white';

      const autoCompleteSymbols = ['(', '{', '[', '<', "'", '"', '`'];
      const completedSymbols = [')', '}', ']', '>', "'", '"', '`'];
      const index = autoCompleteSymbols.indexOf(e.data);
      if(index !== -1) {
        const start = e.target.selectionStart;
        const end = e.target.selectionEnd;
        const first = e.target.value.slice(0, start);
        const last = e.target.value.slice(end);

        e.target.value = `${first}${completedSymbols[index]}${last}`;
        e.target.selectionStart = start + 1;
        e.target.selectionEnd = e.target.selectionStart;
      }

      // Give auto complete code words
      const thisValue = e.target.value.slice(0, e.target.selectionStart).match(/[a-z]+$/i);
      if(!thisValue) return getReadyCodeWords.classList.remove('show');
      renderReadyCodeWords(thisValue[0], textArea.getBoundingClientRect());
    })
    textArea.addEventListener('keydown', e => {
      if(e.code === 'Tab') {
        e.preventDefault();
        if(allUserCodesObj[e.target.parentElement.firstElementChild.textContent].lock) return showResponseFn('You have locked this code');
        const start = e.target.selectionStart,
        end = e.target.selectionEnd;
        e.target.value =
          e.target.value.slice(0, start) +
          '  ' + e.target.value.slice(end);
        e.target.selectionStart = (start + 2);
        e.target.selectionEnd = e.target.selectionStart;
      }
      else if(e.ctrlKey && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        const initialFontNum = parseInt(getComputedStyle(e.target).fontSize);
        if(initialFontNum > 30) return;
        e.target.style.fontSize = `${initialFontNum + 1}px`;
      }
      else if(e.ctrlKey && e.key === '-') {
        e.preventDefault();
        const initialFontNum = parseInt(getComputedStyle(e.target).fontSize);
        if(initialFontNum < 5) return;
        e.target.style.fontSize = `${initialFontNum - 1}px`;
      }
    })

    div.append(h3, hr, textArea, button_copyCode, button_deleteCode, codeSymbolsLimit, lockCodeBtn);
    allUserCodesContainer.appendChild(div);
}

function renderReadyCodeWords(txtValue, textAreaObj) {
  getReadyCodeWordsBlock.textContent = '';
  getReadyCodeWords.style.bottom = '';
  getReadyCodeWords.classList.add('show');
  allReadyWords.forEach(word => {
    if(word.toLowerCase().includes(txtValue.toLowerCase())) {
      const p = document.createElement('p');
      p.textContent = word;
      getReadyCodeWordsBlock.appendChild(p);
    }
  })
  if(!getReadyCodeWordsBlock.childElementCount) return getReadyCodeWords.classList.remove('show');

  const helpContainerObj = getReadyCodeWords.getBoundingClientRect();
  getReadyCodeWords.style.left = `${(textAreaObj.width - helpContainerObj.width) / 2}px`
  let top = textAreaObj.top + window.scrollY - helpContainerObj.height;
  if(top < window.scrollY) {
    getReadyCodeWords.style.top = '';
    top = textAreaObj.bottom + window.scrollY;
  };
  getReadyCodeWords.style.top = top + 'px';
}

function renderUserCodesBlocks() {
  allUserCodesContainer.textContent = '';
  Object.keys(allUserCodesObj).forEach(name => createCodeBlock(name));
}

const userCodeWrap = document.querySelector('.user-code-wrap');

const allUserCodesContainer = document.querySelector('.all-user-codes-container');
allUserCodesContainer.addEventListener('click', e => {
  if(e.target.closest('.copy-code-btn')) { // Copy code
    navigator.clipboard.writeText(e.target.closest('.user-code-block').querySelector('.user-code-content').innerText);
    return showResponseFn('Code copied!');
  }
  else if(e.target.closest('.delete-code-btn')) { // Delete code
    if(allUserCodesObj[e.target.closest('.delete-code-btn').parentElement.firstElementChild.textContent].lock) return showResponseFn('You have locked this code');
    if(!confirm('Delete code?')) return;
    delete allUserCodesObj[e.target.closest('.user-code-block').firstElementChild.textContent];
    renderUserCodesBlocks();
    codeSaveBtn.classList.add('unsaved');
    return showResponseFn('Block been deleted');
  }
  else if(e.target.closest('.lock-code-btn')) { // Lock code
    const initialBtn = e.target.closest('.lock-code-btn');
    allUserCodesObj[initialBtn.parentElement.firstElementChild.textContent].lock =
    !allUserCodesObj[initialBtn.parentElement.firstElementChild.textContent].lock;

    if(allUserCodesObj[initialBtn.parentElement.firstElementChild.textContent].lock) {
      e.target.closest('.lock-code-btn').parentElement.style.boxShadow = '0 0 7px 1px gold';
      initialBtn.style.color = 'gold';
    }
    else {
      e.target.closest('.lock-code-btn').parentElement.style.boxShadow = '0 0 0 0';
      initialBtn.style.color = 'white';
    }
    return codeSaveBtn.classList.add('unsaved');
  }
  [...allUserCodesContainer.children].forEach(child => child.style.height = '60px');
  if(e.target.closest('.user-code-block')) { // Open code block
    const textarea = e.target.closest('.user-code-block').querySelector('.user-code-content');
    textarea.style.height = `${textarea.scrollHeight}px`;
    e.target.closest('.user-code-block').style.height = `${e.target.closest('.user-code-block').scrollHeight}px`;
  }
})

const addCodeBlockForm = document.querySelector('.add-new-block-code-form');

const addCodeBlockBtn = document.querySelector('.add-code-block-btn');
addCodeBlockBtn.addEventListener('click', () => {
  const name = codeBlockName.value.trim();
  if(!name.length) { addCodeBlockForm.classList.remove('show'); return showResponseFn("You don't have a block name")};
  if(allUserCodesObj[name]) return showResponseFn('You used this name');
  if(name.length > 15) return showResponseFn('The name is too long!');

  allUserCodesObj[name] = { code: '', lock: false };

  renderUserCodesBlocks();

  codeBlockName.value = '';
  addCodeBlockForm.classList.remove('show');

  codeSaveBtn.classList.add('unsaved');

  if(allUserCodesContainer.childElementCount >= 15) return toggleAddCodeBlockForm.style.display = 'none';
})

const codeBlockName = addCodeBlockForm.querySelector('.code-block-name-input');

const toggleAddCodeBlockForm = document.querySelector('.toggle-add-new-block-code-form');
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
  const allChildren = [...allUserCodesContainer.children];

  if(!txt.length) return allChildren.forEach(block => block.style.display = 'block');

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

const searchUserCodeArea = document.querySelector('.search-code-textarea');
searchUserCodeArea.addEventListener('input', () => {
  searchUserCodeArea.style.height = `${searchUserCodeArea.scrollHeight}px`;
  renderFoundUserCodes(searchUserCodeArea.value.trim().toLowerCase());
})