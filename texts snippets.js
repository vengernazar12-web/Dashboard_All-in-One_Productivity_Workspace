// Set preloader text
whatIsLoadingText.textContent = 'Loading texts snippets...';

const textsSnippetsWrap = document.querySelector('.texts-snippets-wrap');
textsSnippetsWrap.addEventListener('click', e => {
  if(!e.target.closest('.add-text-snippet-form') && !e.target.classList.contains('toggle-add-text-snippet-btn')) addTextSnippetForm.classList.remove('show');
  if(!e.target.closest('.edit-text-snippet-block') && !e.target.closest('.edit')) editTextSnippetBlock.classList.remove('show');
})
// Open
const openTextsSnippetsWrap = allDashboardItem.querySelector('.open-texts-snippets-wrap');
openTextsSnippetsWrap.addEventListener('click', async () => {
  closeAllWraps();

  if(!allTextsSnippetsObj) {
    showPreloader();
    preloaderProgress.max = 1;
    preloaderProgress.value = 0;
    whatIsLoadingText.textContent = 'Take content...';

    allTextsSnippetsObj = await getContent('texts');
    if(!allTextsSnippetsObj) return;

    preloaderProgress.value = 1;
    whatIsLoadingText.textContent = 'Content taken';
    setTimeout(() => showPreloader(false), 500);
  }

  textsSnippetsWrap.classList.add('show');
  renderTextsSnippets();
})

let allTextsSnippetsObj = null;

const textProgress = textsSnippetsWrap.querySelector('.texts-progress');
const textProgressTxt = textsSnippetsWrap.querySelector('.text-progress-txt');

function createTextSnippetBlock(name, searchVal = null) {
  const regexp = searchVal ? new RegExp(hashHtmlSymbols(searchVal), 'gi') : null;

  const div = document.createElement('div'),
  h4 = document.createElement('h4'),
  divForBtns = document.createElement('div'),
  delBtn = document.createElement('button'),
  editBtn = document.createElement('button'),
  favBtn = document.createElement('button'),
  copyBtn = document.createElement('button'),
  pre = document.createElement('pre');

  searchVal ?
  h4.innerHTML = hashHtmlSymbols(name).replace(regexp, '<mark>$&</mark>')
  : h4.textContent = name;

  div.classList.add('text-block');
  div.dataset.name = name;

  delBtn.classList.add('delete');
  delBtn.innerHTML = '<svg><use href="#delete-code"></use></svg>';
  editBtn.classList.add('edit');
  editBtn.innerHTML = '<svg><use href="#edit"></use></svg>';
  favBtn.classList.add('favorite');
  favBtn.innerHTML = '<svg><use href="#favorite-icon"></use></svg>';
  favBtn.firstElementChild.style.color = allTextsSnippetsObj[name].isFav ? 'gold' : 'var(--text-color)';
  copyBtn.classList.add('copy');
  copyBtn.innerHTML = '<svg><use href="#copy-code"></use></svg>';

  pre.innerHTML = renderTextTags(hashHtmlSymbols(allTextsSnippetsObj[name].txt));

  divForBtns.append(delBtn, editBtn, favBtn, copyBtn);
  div.append(h4, divForBtns, pre);
  return div;
}

function renderTextsSnippets() {
  allTextsSnippetsContainer.textContent = '';
  const frag = document.createDocumentFragment();
  const allTextsSnippetsNames = Object.keys(allTextsSnippetsObj);

  // Render favorites
  for(let n of allTextsSnippetsNames) if(allTextsSnippetsObj[n].isFav) frag.appendChild(createTextSnippetBlock(n));
  // Render no favorites
  for(let n of allTextsSnippetsNames) if(!allTextsSnippetsObj[n].isFav) frag.appendChild(createTextSnippetBlock(n));

  allTextsSnippetsContainer.appendChild(frag);
  for(let p of allTextsSnippetsContainer.querySelectorAll('.text-block > pre')) p.style.height = `${p.scrollHeight + 5}px`;

  textProgress.value = allTextsSnippetsNames.length;
  textProgressTxt.textContent = `${allTextsSnippetsNames.length}/${allBlockLimitsObj.text}`;
}

function renderTextTags(text, isCopy = false) {
  return !isCopy
  ? text
  .replace(/@r(.+?)r@/gs, '<span class="text-red">$1</span>')
  .replace(/@b(.+?)b@/gs, '<span class="text-blue">$1</span>')
  .replace(/@y(.+?)y@/gs, '<span class="text-yellow">$1</span>')
  .replace(/@g(.+?)g@/gs, '<span class="text-green">$1</span>')
  .replace(/@mark(.+?)mark@/gs, '<span class="text-mark">$1</span>')
  .replace(/```(.+?)```/gs, '<pre class="text-code">$1</pre>')
  : text
  .replace(/@r(.+?)r@/gs, '$1')
  .replace(/@b(.+?)b@/gs, '$1')
  .replace(/@y(.+?)y@/gs, '$1')
  .replace(/@g(.+?)g@/gs, '$1')
  .replace(/@mark(.+?)mark@/gs, '$1')
  .replace(/```(.+?)```/gs, '$1');
}

// All texts container
const allTextsSnippetsContainer = textsSnippetsWrap.querySelector('.all-texts-snippets-container');
allTextsSnippetsContainer.addEventListener('click', e => {
  const target = e.target;
  if(target.closest('.copy')) { // Copy text
    const snippetBlock = target.closest('.text-block');
    const snippetName = snippetBlock.dataset.name;
    navigator.clipboard.writeText(renderTextTags(allTextsSnippetsObj[snippetName].txt, true));
    showResponseFn('Copied');
  }
  else if(target.closest('.favorite')) { // Favorite
    const snippetName = target.closest('.text-block').dataset.name;
    allTextsSnippetsObj[snippetName].isFav = !allTextsSnippetsObj[snippetName].isFav;
    renderTextsSnippets();
    textSaveBtn.classList.add('unsaved');

    // Write to user actions
    writeToUserActions(allTextsSnippetsObj[snippetName].isFav ? `Позначено блок тексту з назвою ${snippetName} як фаворит` : `Забрато блок тексту з назвою ${snippetName} з фаворитів`);
  }
  else if(target.closest('.delete')) { // Delete
    if(localStorage.getItem('conf-before-delete') === 'true' && !confirm('Delete?')) return;
    const snippetBlock = target.closest('.text-block');
    const snippetName = snippetBlock.dataset.name;

    initUndoActionBlock('texts', allTextsSnippetsObj);

    delete allTextsSnippetsObj[snippetName];
    textSaveBtn.classList.add('unsaved');

    if(localStorage.getItem('disabled-anim') === 'true') return renderTextsSnippets();

    snippetBlock.classList.add('del-anim');
    setTimeout(() => renderTextsSnippets(), delAnimTime);

    // Write to user actions
    writeToUserActions(`Видалено блок тексту з назвою ${snippetName}`);
  }
  else if(target.closest('.edit')) { // Open edit
    editTextSnippetBlock.classList.add('show');

    const snippetName = target.closest('.text-block').dataset.name;
    const snippetContent = allTextsSnippetsObj[snippetName].txt;
    nameBeforeEdit = snippetName;
    contentBeforeEdit = snippetContent;

    editTextSnippetNameInput.value = snippetName;
    editTextSnippetContentTextarea.value = snippetContent;

    editTextSnippetContentTextarea.style.height = '45px';
    editTextSnippetContentTextarea.style.height = `${editTextSnippetContentTextarea.scrollHeight}px`;

    editTextSnippetContentLimitTxt.textContent = `${snippetContent.length}/${allValuesLimit.textContent}`;
  }
})

// Add text snippet
const addTextSnippetForm = textsSnippetsWrap.querySelector('.add-text-snippet-form');
const textSnippetContentLimitTxt = addTextSnippetForm.querySelector('.content-limit-txt');
// Toggle text snippet btn
const toggleAddTextSnippetForm = textsSnippetsWrap.querySelector('.toggle-add-text-snippet-btn');
toggleAddTextSnippetForm.addEventListener('click', () => {
  addTextSnippetForm.classList.toggle('show');
  textSnippetContentLimitTxt.textContent = `0/${allValuesLimit.textContent}`;
  addTextSnippetNameInput.value = '';
  addTextSnippetContentTextarea.value = '';
  addTextSnippetNameInput.focus();
});

const addTextSnippetNameInput = addTextSnippetForm.querySelector('.add-text-snippet-name-input');
addTextSnippetNameInput.addEventListener('input', () => addTextSnippetNameInput.style.color = addTextSnippetNameInput.value.trim().length > allValuesLimit.textName ? 'red' : 'var(--text-color)');

const addTextSnippetContentTextarea = addTextSnippetForm.querySelector('.add-text-snippet-content-textarea');
addTextSnippetContentTextarea.addEventListener('input', () => {
  addTextSnippetContentTextarea.style.height = '45px';
  addTextSnippetContentTextarea.style.height = `${addTextSnippetContentTextarea.scrollHeight}px`;

  const contentLng = addTextSnippetContentTextarea.value.trim().length;
  addTextSnippetContentTextarea.style.color = contentLng > allValuesLimit.textContent ? 'red' : 'var(--text-color)';
  textSnippetContentLimitTxt.textContent = `${contentLng}/${allValuesLimit.textContent}`;
});

const addTextSnippetBtn = addTextSnippetForm.querySelector('.add-text-snippet-btn');
addTextSnippetBtn.addEventListener('click', () => {
  let allTextsLng = Object.keys(allTextsSnippetsObj).length;
  if(allTextsLng >= allBlockLimitsObj.text) {
    addTextSnippetForm.classList.remove('show');
    return showResponseFn(`You have ${allTextsLng}/${allBlockLimitsObj.text} text blocks`);
  }

  const name = addTextSnippetNameInput.value.trim();
  if(!name) return addTextSnippetForm.classList.remove('show');
  if(name.length > allValuesLimit.textName) {
    addTextSnippetForm.classList.remove('show');
    return showResponseFn(`Name: length ${name.length}/${allValuesLimit.textName}`);
  }
  if(Object.keys(allTextsSnippetsObj).find(n => n == name)) return showResponseFn('You already used this name');
  const content = addTextSnippetContentTextarea.value.trim();
  if(!content) return addTextSnippetForm.classList.remove('show');
  if(content.length > allValuesLimit.textContent) {
    addTextSnippetForm.classList.remove('show');
    return showResponseFn(`Text: length ${content.length}/${allValuesLimit.textContent}`);
  };

  addTextSnippetNameInput.value = '';
  addTextSnippetContentTextarea.value = '';
  addTextSnippetForm.classList.remove('show');

  initUndoActionBlock('texts', allTextsSnippetsObj);

  allTextsSnippetsObj[name] = {txt: content,}
  renderTextsSnippets();

  textSaveBtn.classList.add('unsaved');

  // Write to user action
  writeToUserActions(`Додано новий блок тексту з назвою ${name}`);
})

// Edit text snippet
let nameBeforeEdit = null;
let contentBeforeEdit = null;

const editTextSnippetBlock = textsSnippetsWrap.querySelector('.edit-text-snippet-block');
const editTextSnippetContentLimitTxt = editTextSnippetBlock.querySelector('.content-limit-txt');

const editTextSnippetNameInput = editTextSnippetBlock.querySelector('.edit-name-input');

const editTextSnippetContentTextarea = editTextSnippetBlock.querySelector('.edit-content-textarea');
editTextSnippetContentTextarea.addEventListener('input', () => {
  editTextSnippetContentTextarea.style.height = '45px';
  editTextSnippetContentTextarea.style.height = `${editTextSnippetContentTextarea.scrollHeight}px`;

  const contentLng = editTextSnippetContentTextarea.value.trim().length;
  editTextSnippetContentTextarea.style.color = contentLng > allValuesLimit.textContent ? 'red' : 'var(--text-color)';
  editTextSnippetContentLimitTxt.textContent = `${contentLng}/${allValuesLimit.textContent}`;
})

const confirmTextSnippetEditChangeBtn = editTextSnippetBlock.querySelector('.confirm-edit-change');
confirmTextSnippetEditChangeBtn.addEventListener('click', () => {
  editTextSnippetBlock.classList.remove('show');

  const name = editTextSnippetNameInput.value.trim();
  if(!name) return showResponseFn("You don't have name");
  if(name.length > allValuesLimit.textName) return showResponseFn(`You have name length limit (${name.length}/${allValuesLimit.textName})`);
  if(Object.keys(allTextsSnippetsObj).find(n => n === name && n !== nameBeforeEdit)) return showResponseFn('You already used this name');

  const content = editTextSnippetContentTextarea.value.trim();
  if(!content) return showResponseFn("You don't have content");
  if(content.length > allValuesLimit.textContent) return showResponseFn('Your content is too long');

  if(nameBeforeEdit === name && contentBeforeEdit === content) return;

  initUndoActionBlock('texts', allTextsSnippetsObj);

  allTextsSnippetsObj[nameBeforeEdit].txt = content;
  const objForEdit = allTextsSnippetsObj[nameBeforeEdit];
  delete allTextsSnippetsObj[nameBeforeEdit];
  allTextsSnippetsObj[name] = objForEdit;

  textSaveBtn.classList.add('unsaved');
  renderTextsSnippets();
  showResponseFn('The text block has been edited.');

  // Write to user actions
  writeToUserActions(
    nameBeforeEdit !== name && contentBeforeEdit !== content ? `Оновлено назву блоку тексту з '${nameBeforeEdit}' на '${name}' та контент з '${contentBeforeEdit}' на '${content}'`
    : nameBeforeEdit !== name ? `Оновлено назву блоку тексту з '${nameBeforeEdit}' на '${name}'`
    : `Оновлено контент блоку тексту з назвою '${name}' з '${contentBeforeEdit}' на '${content}'`
  );
});

// Search texts blocks
const searchTextsSnippetsInput = textsSnippetsWrap.querySelector('.search-texts-snippets-input');
searchTextsSnippetsInput.addEventListener('input', () => {
  const val = searchTextsSnippetsInput.value.trim();
  if(!val) return renderTextsSnippets();
  const safeVal = val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const allNames = Object.keys(allTextsSnippetsObj);
  const frag = document.createDocumentFragment();
  allTextsSnippetsContainer.textContent = '';
  // Render favorites
  for(let n of allNames) if(n.includes(val) && allTextsSnippetsObj[n].isFav) frag.appendChild(createTextSnippetBlock(n, safeVal));
  // Render no favorites
  for(let n of allNames) if(n.includes(val) && !allTextsSnippetsObj[n].isFav) frag.appendChild(createTextSnippetBlock(n, safeVal));

  allTextsSnippetsContainer.appendChild(frag);
  if(!allTextsSnippetsContainer.childElementCount) allTextsSnippetsContainer.innerHTML = '<h2>No texts found...</h2>';
});

// Set preloader value
preloaderProgress.value = 11;