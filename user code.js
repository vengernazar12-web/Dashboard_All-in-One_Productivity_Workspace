let allUserCodesObj = {};
function renderUserCodesBlocks() {
  allUserCodesContainer.textContent = '';
  Object.keys(allUserCodesObj).forEach(name => {
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
      const autoCompleteSymbolsIndex = autoCompleteSymbols.indexOf(e.data);
      if(autoCompleteSymbolsIndex !== -1) e.target.value += completedSymbols[autoCompleteSymbolsIndex];

      codeSaveBtn.classList.add('unsaved');
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
  })
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