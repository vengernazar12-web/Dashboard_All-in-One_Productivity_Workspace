// Set preloader text
whatIsLoadingText.textContent = 'Loading notes system...';

const notesWrap = document.querySelector('.notes-wrap');
const notesContentWrap = document.querySelector('.notes-content-wrap');
// Open note wrap
const openNoteWrapBtn = allDashboardItem.querySelector('.open-notes-wrap');
openNoteWrapBtn.addEventListener('click', () => {
  closeAllWraps();
  showPreloader();
  renderNotesBlocks();
  notesWrap.classList.add('show');
  if(allUserNotesCont.childElementCount >= allBlockLimitsObj.notes) openAddNoteForm.style.display = 'none';
  showPreloader(false);
  searchNoteBlocksInput.value = '';
})

// Close notes content wrap
notesContentWrap.querySelector('.close-notes-content-wrap')
.addEventListener('click', () => {
  if(userNotesText.value.trim() === noteTxt) return notesContentWrap.classList.remove('show');
  const name = notesContentTitle.textContent;
  allNotesObj[name].txt = userNotesText.value.trim();
  showResponseFn(`Save "${name}" note text`);
  notesContentWrap.classList.remove('show');
  noteSaveBtn.classList.add('unsaved');
});

let allNotesObj = {};

// Note progress
const noteProgress = notesWrap.querySelector('.note-progress');
const notesBlocksLimitText = notesWrap.querySelector('.notes-blocks-limit');

// Add note form
const openAddNoteForm = notesWrap.querySelector('.toggle-add-note-form');
openAddNoteForm.addEventListener('click', () => {
  if(allUserNotesCont.childElementCount >= allBlockLimitsObj.notes) {
    openAddNoteForm.style.display = 'none';
    return showResponseFn(`You have max notes ${allBlockLimitsObj.notes}/${allBlockLimitsObj.notes}`);
  };
  addNotesForm.classList.toggle('show');
  addNoteInputName.focus();
})

const addNotesForm = notesWrap.querySelector('.add-notes-inputs');

const addNoteInputName = addNotesForm.querySelector('.note-name-input');
addNoteInputName.addEventListener('input', () => addNoteInputName.style.color = addNoteInputName.value.trim().length > allValuesLimit.noteName ? 'red' : 'white');

const addNoteInputDescription = addNotesForm.querySelector('.note-description-input');
addNoteInputDescription.addEventListener('input', () => addNoteInputDescription.style.color = addNoteInputDescription.value.trim().length > allValuesLimit.noteDesc ? 'red' : 'white');

const addNotesButton = addNotesForm.querySelector('.add-note-button');
addNotesButton.addEventListener('click', () => {
  if(allUserNotesCont.childElementCount >= allBlockLimitsObj.notes) return showResponseFn('Your have note blocks limit');
  const name = addNoteInputName.value.trim();
  let desc = addNoteInputDescription.value.trim() || 'Description';
  if(desc.length > allValuesLimit.noteDesc) return showResponseFn('The description is too long (more than 250 characters)');

  if(!name) {addNotesForm.classList.remove('show'); return showResponseFn("You don't have a note name !")};
  if(allNotesObj[name]) return showResponseFn('You are using this name');
  if(name.length > allValuesLimit.noteName) return showResponseFn('Note name is too long (more than 50 characters)');

  addNoteInputName.value = '';
  addNoteInputDescription.value = '';
  addNotesForm.classList.remove('show');

  allNotesObj[name] = { description: desc, txt: '' };

  renderNotesBlocks();

  noteSaveBtn.classList.add('unsaved');

  setOpenBtnsTexts();

  if(allUserNotesCont.childElementCount >= allBlockLimitsObj.notes) openAddNoteForm.style.display = 'none';

  // Save change for userActions
  writeToUserActions(`Користувач додав нову нотатку з назвою ${name}${desc !== 'Description' ? ` та з описом ${desc}` : ''}`);
})

// Edit note
let initEditingNoteName = null;
let descBeforeEdit = null;

const editNoteBlock = notesWrap.querySelector('.edit-note-block');
const editNoteNameInput = editNoteBlock.querySelector('.edit-note-name-input');
const editNoteDescInput = editNoteBlock.querySelector('.edit-note-desc-input');

const confNoteEditChangeBtn = editNoteBlock.querySelector('.conf-note-edit-change-btn');
confNoteEditChangeBtn.addEventListener('click', () => {
  editNoteBlock.classList.remove('show');

  const newName = editNoteNameInput.value.trim();
  const newDesc = editNoteDescInput.value.trim();

  if(newName === initEditingNoteName && descBeforeEdit === newDesc) return;
  if(!newName || !newDesc) return showResponseFn(`You don't have a note ${!newName ? 'name' : 'description'}`);

  allNotesObj[initEditingNoteName].description = newDesc;

  const objForEditName = allNotesObj[initEditingNoteName];

  delete allNotesObj[initEditingNoteName];
  allNotesObj[newName] = objForEditName;

  renderNotesBlocks();
  showResponseFn('The note has been edited.');

  noteSaveBtn.classList.add('unsaved');

  // Save change for userActions
  writeToUserActions(
    newName !== initEditingNoteName && descBeforeEdit !== newDesc
    ? `Користувач замінив назву нотатки з ${initEditingNoteName} на ${newName} та опис з ${descBeforeEdit} на ${newDesc}`
    : newName !== initEditingNoteName ? `Користувач замінив назву нотатки з ${initEditingNoteName} на ${newName}`
    : `Користувач замінив опис нотатки з назвою ${initEditingNoteName} з ${descBeforeEdit} на ${newDesc}`
  );
})

// Delegation
let delNoteTimer = null;
const allUserNotesCont = notesWrap.querySelector('.all-user-notes-container');
allUserNotesCont.addEventListener('click', e => {
  if(e.target.closest('.delete-note-btn')) { // Delete note block
    if(localStorage.getItem('conf-before-delete') === 'true' && !confirm('Delete note?')) return;

    const noteBlock = e.target.closest('.note-block');
    const noteName = noteBlock.firstElementChild.textContent;

    delete allNotesObj[noteName];
    noteSaveBtn.classList.add('unsaved');

    if(localStorage.getItem('disabled-anim') === 'true') return renderNotesBlocks();

    noteBlock.classList.add('del-anim');
    clearTimeout(delNoteTimer);
    delNoteTimer = setTimeout(renderNotesBlocks, delAnimTime);
    setOpenBtnsTexts();

    // Save change for userActions
    writeToUserActions(`Користувач видалив нотатку з назвою ${noteName}`);
  }
  else if(e.target.closest('.fav-note-btn')) { // Favorite note block
    const noteName = e.target.closest('.note-block').firstElementChild.textContent;
    allNotesObj[noteName].isFav = !allNotesObj[noteName].isFav;

    renderNotesBlocks();

    noteSaveBtn.classList.add('unsaved');

    // Save change for userActions
    writeToUserActions(allNotesObj[noteName].isFav ? `Користувач позначив нотатку з назвою ${noteName} як фаворіт` : `Користувач забрав нотатку з назвою ${noteName} з фаворітів`);
  }
  else if(e.target.closest('.edit-note-btn')) { // Edit
    const targetNoteBlockName = e.target.closest('.note-block').firstElementChild.textContent;
    editNoteBlock.classList.add('show');
    editNoteNameInput.value = targetNoteBlockName;
    editNoteDescInput.value = allNotesObj[targetNoteBlockName].description;

    initEditingNoteName = targetNoteBlockName;
    descBeforeEdit = allNotesObj[targetNoteBlockName].description;
  }
  else if(e.target.closest('.note-block')) { // Open note content
    const name = e.target.closest('.note-block').firstElementChild.textContent;
    renderNotesText(name);
  }
})

/* Notes content */
const notesSymbolsLimitText = notesContentWrap.querySelector('.notes-symbols-limit-text');
const notesContentTitle = notesContentWrap.querySelector('h3');

const userNotesText = notesContentWrap.querySelector('.notes-user-content');
userNotesText.addEventListener('input', () => {
  const lng = userNotesText.value.replaceAll('\n', '').length;
  notesSymbolsLimitText.style.color = lng > 2000 ? 'red' : 'var(--text-color)';
  notesSymbolsLimitText.textContent = `${lng}/2000`;
})

/* Render functions */
function createNoteBlock( name, desc, isFavorite, searchVal ) {
  let regexp = null;
  if(searchVal) regexp = new RegExp(searchVal, 'gi');

  const div = document.createElement('div'),
    h2 = document.createElement('h2'),
    hr = document.createElement('hr'),
    p = document.createElement('p'),
    btnsCont = document.createElement('div'),
    delBtn = document.createElement('button'),
    favBtn = document.createElement('button'),
    editBtn = document.createElement('button'),
    hr2 = document.createElement('hr');

  div.classList.add('note-block');

  if(!searchVal) {
    h2.textContent = name;
    p.textContent = desc;
  } else {
    h2.innerHTML = name.replace(regexp, '<mark>$&</mark>');
    p.innerHTML = desc.replace(regexp, '<mark>$&</mark>');
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
  userNotesText.value = allNotesObj[name].txt
  noteTxt = userNotesText.value.trim();
  notesContentTitle.textContent = name;
  userNotesText.style.fontSize = `${localStorage.getItem('notes-font-size') || 1.2}rem`;
  notesContentWrap.classList.add('show');
  notesSymbolsLimitText.textContent = `${userNotesText.value.replaceAll('\n', '').length}/2000`;
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
})

// Search note text
const searchNoteTextInput = notesContentWrap.querySelector('.search-note-text-input');
searchNoteTextInput.addEventListener('input', e => {
  const searchText = searchNoteTextInput.value.trim()
  .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if(!searchText) return userNotesText.innerHTML = allNotesObj[notesContentTitle.textContent].txt.replaceAll('\n', '<br>');

  const regex = new RegExp(`(?<!<)${searchText}(?!>)`, "gi");
  userNotesText.innerHTML = allNotesObj[notesContentTitle.textContent].txt
  .replaceAll('\n', '<br>')
  .replaceAll(regex, match => `<mark>${match}</mark>`);
})
searchNoteTextInput.addEventListener('focus', () => { allNotesObj[notesContentTitle.textContent].txt = userNotesText.innerText; })
searchNoteTextInput.addEventListener('blur', () => {
  searchNoteTextInput.value = '';
  userNotesText.innerHTML = allNotesObj[notesContentTitle.textContent].txt
  .replaceAll(/<\/?mark/g, '')
  .replaceAll('\n', '<br>');
})

// Set preloader value
preloaderProgress.value = 3;