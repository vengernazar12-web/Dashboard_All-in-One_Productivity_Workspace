const notesWrap = document.querySelector('.notes-wrap');
notesWrap.addEventListener('click', e => {
  if(!e.target.closest('.add-notes-inputs') && !e.target.classList.contains('toggle-add-note-form')) addNotesForm.classList.remove('show');
  if(!e.target.closest('.edit-note-block') && !e.target.closest('.edit-note-btn')) editNoteBlock.classList.remove('show');
})

const notesContentWrap = document.querySelector('.notes-content-wrap');
// Open note wrap
const openNoteWrapBtn = allDashboardItem.querySelector('.open-notes-wrap');
openNoteWrapBtn.addEventListener('click', async () => {
  closeAllWraps();
  if(needPushState) history.pushState({}, null, '#notes');

  if(!allNotesObj) {
    showPreloader();
    preloaderProgress.max = 1;
    preloaderProgress.value = 0;
    whatIsLoadingText.textContent = 'Take content...';

    allNotesObj = await getContent('notes');
    if(!allNotesObj) return;

    preloaderProgress.value = 1;
    whatIsLoadingText.textContent = 'Content taken';
    setTimeout(() => showPreloader(false), 500);
  }

  renderNotesBlocks();
  notesWrap.classList.add('show');
})

// Close notes content wrap
notesContentWrap.querySelector('.close-notes-content-wrap')
.addEventListener('click', () => {
  if(userNotesText.textContent.trim() === noteTxt) return notesContentWrap.classList.remove('show');

  const name = notesContentTitle.textContent;
  allNotesObj[name].txt = userNotesText.innerText.trim();
  showResponseFn(`Save "${name}" note text`);
  notesContentWrap.classList.remove('show');
  noteSaveBtn.classList.add('unsaved');
});

let allNotesObj = null;

// Note progress
const noteProgress = notesWrap.querySelector('.note-progress');
const notesBlocksLimitText = notesWrap.querySelector('.notes-blocks-limit');

// Add note
const openAddNoteForm = notesWrap.querySelector('.toggle-add-note-form');
openAddNoteForm.addEventListener('click', () => {
  addNotesForm.classList.toggle('show');
  addNoteInputName.focus();
})

const addNotesForm = notesWrap.querySelector('.add-notes-inputs');

const addNoteInputName = addNotesForm.querySelector('.note-name-input');
addNoteInputName.addEventListener('input', () => {
  addNoteInputName.style.color = addNoteInputName.value.trim().length > allValuesLimit.noteName ? 'red' : 'var(--text-color)';
  renderShowFieldsBlock(Object.keys(allNotesObj), addNoteInputName.value.trim(), addNoteInputName);
});

const addNoteInputDescription = addNotesForm.querySelector('.note-description-input');
addNoteInputDescription.addEventListener('input', () => addNoteInputDescription.style.color = addNoteInputDescription.value.trim().length > allValuesLimit.noteDesc ? 'red' : 'var(--text-color)');

const addNotesButton = addNotesForm.querySelector('.add-note-button');
addNotesButton.addEventListener('click', () => {
  if(Object.keys(allNotesObj).length >= allBlockLimitsObj.notes) return showResponseFn('Your have note blocks limit');
  const name = addNoteInputName.value.trim();
  let desc = addNoteInputDescription.value.trim() || 'Description';
  if(desc.length > allValuesLimit.noteDesc) return showResponseFn('The description is too long (more than 250 characters)');

  if(!name) {addNotesForm.classList.remove('show'); return showResponseFn("You don't have a note name !")};
  if(allNotesObj[name]) return showResponseFn('You are using this name');
  if(name.length > allValuesLimit.noteName) return showResponseFn('Note name is too long (more than 50 characters)');

  addNoteInputName.value = '';
  addNoteInputDescription.value = '';
  addNotesForm.classList.remove('show');

  initUndoActionBlock('notes', allNotesObj);

  allNotesObj[name] = { description: desc, txt: '' };

  renderNotesBlocks();

  noteSaveBtn.classList.add('unsaved');
})

// Edit note
let initEditingNoteName = null;
let descBeforeEdit = null;

const editNoteBlock = notesWrap.querySelector('.edit-note-block');

const editNoteNameInput = editNoteBlock.querySelector('.edit-note-name-input');
editNoteNameInput.addEventListener('input', () => {
  editNoteNameInput.style.color = editNoteNameInput.value.trim().length > allValuesLimit.noteName ? 'red' : 'var(--text-color)';
  renderShowFieldsBlock(Object.keys(allNotesObj), editNoteNameInput.value.trim(), editNoteNameInput);
});

const editNoteDescInput = editNoteBlock.querySelector('.edit-note-desc-input');
editNoteDescInput.addEventListener('input', () => editNoteDescInput.style.color = editNoteDescInput.value.trim().length > allValuesLimit.noteDesc ? 'red' : 'var(--text-color)');

// Confirm edit change
const confNoteEditChangeBtn = editNoteBlock.querySelector('.conf-note-edit-change-btn');
confNoteEditChangeBtn.addEventListener('click', () => {
  editNoteBlock.classList.remove('show');

  editNoteNameInput.style.color = 'var(--text-color)';
  editNoteDescInput.style.color = 'var(--text-color)';

  const newName = editNoteNameInput.value.trim();
  if(newName.length > allValuesLimit.noteName) return showResponseFn('Your new name is too long');
  if(Object.keys(allNotesObj).find(n => n === newName && n !== initEditingNoteName)) return showResponseFn('You already used this name');
  const newDesc = editNoteDescInput.value.trim();
  if(newDesc.length > allValuesLimit.noteDesc) return showResponseFn('Your new description is too long');

  if(newName === initEditingNoteName && descBeforeEdit === newDesc) return;
  if(!newName || !newDesc) return showResponseFn(`You don't have a note ${!newName ? 'name' : 'description'}`);

  initUndoActionBlock('notes', allNotesObj);

  allNotesObj[initEditingNoteName].description = newDesc;

  const objForEditName = allNotesObj[initEditingNoteName];

  delete allNotesObj[initEditingNoteName];
  allNotesObj[newName] = objForEditName;

  renderNotesBlocks();
  showResponseFn('The note has been edited.');

  noteSaveBtn.classList.add('unsaved');
})

// Delegation
const allUserNotesCont = notesWrap.querySelector('.all-user-notes-container');
allUserNotesCont.addEventListener('click', e => {
  if(e.target.closest('.delete-note-btn')) { // Delete note block
    if(localStorage.getItem('conf-before-delete') === 'true' && !confirm('Delete note?')) return;

    const noteBlock = e.target.closest('.note-block');
    const noteName = noteBlock.firstElementChild.textContent;

    initUndoActionBlock('notes', allNotesObj);

    delete allNotesObj[noteName];
    noteSaveBtn.classList.add('unsaved');

    if(localStorage.getItem('disabled-anim') === 'true') return renderNotesBlocks();

    noteBlock.classList.add('del-anim');
    setTimeout(renderNotesBlocks, delAnimTime);
  }
  else if(e.target.closest('.fav-note-btn')) { // Favorite note block
    const noteName = e.target.closest('.note-block').firstElementChild.textContent;
    allNotesObj[noteName].isFav = !allNotesObj[noteName].isFav;

    renderNotesBlocks();

    noteSaveBtn.classList.add('unsaved');
  }
  else if(e.target.closest('.edit-note-btn')) { // Open edit block
    const targetNoteBlockName = e.target.closest('.note-block').firstElementChild.textContent;
    editNoteBlock.classList.add('show');
    editNoteNameInput.value = targetNoteBlockName;
    editNoteDescInput.value = allNotesObj[targetNoteBlockName].description;

    initEditingNoteName = targetNoteBlockName;
    descBeforeEdit = allNotesObj[targetNoteBlockName].description;
  }
  else if(e.target.closest('.note-block')) { // Open note content
    const name = e.target.closest('.note-block').dataset.name;
    renderNotesText(name);
  }
})

/* Notes content */
const notesSymbolsLimitText = notesContentWrap.querySelector('.notes-symbols-limit-text');
const notesContentTitle = notesContentWrap.querySelector('h3');

const userNotesText = notesContentWrap.querySelector('.notes-user-content');
userNotesText.addEventListener('input', () => {
  const lng = userNotesText.innerText.replaceAll('\n', '').length;
  notesSymbolsLimitText.style.color = lng > allValuesLimit.notesContent ? 'red' : 'var(--text-color)';
  notesSymbolsLimitText.textContent = `${lng}/${allValuesLimit.notesContent}`;
})
userNotesText.addEventListener('blur', () => {
  const txt = userNotesText.innerText;
  if(txt.includes('<') || txt.includes('>')) {
    userNotesText.innerText = txt.replace(/[<>]/g, '');
    showResponseFn('The symbols "<>" are not allowed in notes');
  };
});

/* Render functions */
function createNoteBlock( name, desc, isFavorite, searchVal ) {
  let regexp = !searchVal ? null : new RegExp(hashHtmlSymbols(searchVal), 'gi');

  const div = document.createElement('div'),
    h2 = document.createElement('h2'),
    hr = document.createElement('hr'),
    p = document.createElement('p'),
    btnsCont = document.createElement('div'),
    delBtn = document.createElement('button'),
    favBtn = document.createElement('button'),
    editBtn = document.createElement('button'),
    hr2 = document.createElement('hr');

  div.dataset.name = name;
  div.classList.add('note-block');

  if(!searchVal) {
    h2.textContent = name;
    p.textContent = desc;
  } else {
    h2.innerHTML = hashHtmlSymbols(name).replace(regexp, '<mark>$&</mark>');
    p.innerHTML = hashHtmlSymbols(desc).replace(regexp, '<mark>$&</mark>');
  };

  btnsCont.classList.add('note-block-btns-cont');
  btnsCont.append(delBtn, favBtn, editBtn);

  delBtn.innerHTML = '<svg><use href="#delete-code"></use></svg>';
  delBtn.classList.add('delete-note-btn');

  favBtn.innerHTML = '<svg><use href="#favorite-icon"></use></svg>';
  favBtn.classList.add('fav-note-btn');
  favBtn.style.color = isFavorite ? 'rgb(255, 255, 122)' : 'white';
  favBtn.style.boxShadow = isFavorite ? '0 0 3px 1px gold' : '0 0 0 0 white';

  editBtn.classList.add('edit-note-btn');
  editBtn.innerHTML = '<svg><use href="#edit"></use></svg>';

  div.append(h2, hr, p, hr2, btnsCont);

  return div;
}
let noteTxt = null;
function renderNotesText(name) {
  userNotesText.innerHTML = allNotesObj[name].txt.replaceAll('\n', '<br>');
  noteTxt = userNotesText.textContent.trim();
  notesContentTitle.textContent = name;
  userNotesText.style.fontSize = `${localStorage.getItem('notes-font-size') || 1.2}rem`;
  notesContentWrap.classList.add('show');
  notesSymbolsLimitText.textContent = `${allNotesObj[name].txt.replaceAll('\n', '').length}/${allValuesLimit.notesContent}`;
}
function renderNotesBlocks() {
  const arr = Object.keys(allNotesObj);

  if(!arr.length) {
    allUserNotesCont.textContent = '';
    noteProgress.value = 0;
    return notesBlocksLimitText.textContent = `Notes: 0/${allBlockLimitsObj.notes}`;
  }

  allUserNotesCont.textContent = '';
  const frag = document.createDocumentFragment();

  // Render favorite notes
  for(let name of arr) if(allNotesObj[name].isFav) frag.appendChild(createNoteBlock(name, allNotesObj[name].description, true));
  // Render no favorite notes
  for(let name of arr) if(!allNotesObj[name].isFav) frag.appendChild(createNoteBlock(name, allNotesObj[name].description, false));
  // Append fragment
  allUserNotesCont.appendChild(frag);

  const notesBlocksLng = arr.length;
  noteProgress.value = notesBlocksLng;
  notesBlocksLimitText.textContent = `Notes: ${notesBlocksLng}/${allBlockLimitsObj.notes}`;
}

// Search note blocks
const searchNoteBlocksInput = notesWrap.querySelector('.search-note-blocks-input');
searchNoteBlocksInput.addEventListener('input', () => {
  const val = searchNoteBlocksInput.value.toLowerCase().trim();
  const safeVal = val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  allUserNotesCont.textContent = '';
  const frag = document.createDocumentFragment();

  // Render favorite notes
  for(let n in allNotesObj) {
    const objInfo = allNotesObj[n];
    if(
      objInfo.isFav
      && (
        n.toLowerCase().includes(val)
        || objInfo.description.toLowerCase().includes(val)
      )
    ) frag.appendChild(createNoteBlock(n, allNotesObj[n].description, true, safeVal));
  };

  // Render no favorite notes
  for(let n in allNotesObj) {
    const objInfo = allNotesObj[n];
    if(
      !allNotesObj[n].isFav
      && (
        n.toLowerCase().includes(val)
        || objInfo.description.toLowerCase().includes(val)
      )
    ) frag.appendChild(createNoteBlock(n, allNotesObj[n].description, false, safeVal));
  }

  // Append fragment
  allUserNotesCont.appendChild(frag);
  if(!allUserNotesCont.childElementCount) allUserNotesCont.innerHTML = '<h2>No notes found...</h2>';
})

// Search note text
const searchNoteTextInput = notesContentWrap.querySelector('.search-note-text-input');
searchNoteTextInput.addEventListener('input', () => {
  const searchText = hashHtmlSymbols(searchNoteTextInput.value.trim())
  .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if(!searchText) return userNotesText.innerText = allNotesObj[notesContentTitle.textContent].txt;

  const regex = new RegExp(`(?<!<)${searchText}(?!>)`, "gi");
  userNotesText.innerHTML = hashHtmlSymbols(allNotesObj[notesContentTitle.textContent].txt)
  .replaceAll('\n', '<br>')
  .replaceAll(regex, match => `<mark>${match}</mark>`);

  const firstMark = userNotesText.querySelector('mark');
  if(firstMark) firstMark.scrollIntoView({block: 'center', behavior: 'smooth'});
})
searchNoteTextInput.addEventListener('focus', () => allNotesObj[notesContentTitle.textContent].txt = userNotesText.innerText)
searchNoteTextInput.addEventListener('blur', () => {
  searchNoteTextInput.value = '';
  userNotesText.innerText = allNotesObj[notesContentTitle.textContent].txt;
})
