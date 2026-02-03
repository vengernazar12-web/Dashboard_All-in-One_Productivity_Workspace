// Set preloader text
whatIsLoadingText.textContent = 'Loading notes system...';

const notesWrap = document.querySelector('.notes-wrap');
const notesContentWrap = document.querySelector('.notes-content-wrap');
// Open note wrap
allDashboardItem.querySelector('.open-notes-wrap')
.addEventListener('click', () => {
  showPreloader();
  renderNotesBlocks();
  notesWrap.classList.add('show');
  if(allUserNotesCont.childElementCount >= 25) openAddNoteForm.style.display = 'none';
  showPreloader(false);
  searchNoteBlocksInput.value = '';
})
// Close note wrap
notesWrap.querySelector('.close-notes-wrap')
.addEventListener('click', () => notesWrap.classList.remove('show'))
// Close notes content wrap
notesContentWrap.querySelector('.close-notes-content-wrap')
.addEventListener('click', e => {
  if(userNotesText.textContent.trim() === noteTxt.trim()) return notesContentWrap.classList.remove('show');
  noteSaveBtn.classList.add('unsaved')
  const name = notesContentTitle.textContent;
  allNotesObj[name].txt = userNotesText.innerText.trim();
  showResponseFn(`Save "${name}" note text`);
  notesContentWrap.classList.remove('show');
  isNotesUnsaved = true;
});

let allNotesObj = {};

// Note progress
const noteProgress = notesWrap.querySelector('.note-progress');
const notesBlocksLimitText = notesWrap.querySelector('.notes-blocks-limit');

// Add note form
const openAddNoteForm = notesWrap.querySelector('.toggle-add-note-form');
openAddNoteForm.addEventListener('click', () => {
  if(allUserNotesCont.childElementCount >= 25) {
    openAddNoteForm.style.display = 'none';
    return showResponseFn('You have max notes 25/25');
  };
  addNotesForm.classList.toggle('show');
  addNoteInputName.focus();
})

const addNotesForm = notesWrap.querySelector('.add-notes-inputs');
const addNoteInputName = addNotesForm.querySelector('.note-name-input');
const addNoteInputDescription = addNotesForm.querySelector('.note-description-input');

const addNotesButton = addNotesForm.querySelector('.add-note-button');
addNotesButton.addEventListener('click', () => {
  if(allUserNotesCont.childElementCount >= 25) return showResponseFn('Your have note blocks limit');
  const name = addNoteInputName.value.trim();
  let desc = addNoteInputDescription.value.trim();
  if(!desc) desc = 'Description';

  if(!name) {addNotesForm.classList.remove('show'); return showResponseFn("You don't have a note name !")};
  if(allNotesObj[name]) return showResponseFn('You are using this name');

  addNoteInputName.value = '';
  addNoteInputDescription.value = '';
  addNotesForm.classList.remove('show');

  allNotesObj[name] = { description: desc, txt: '' };

  renderNotesBlocks();

  noteSaveBtn.classList.add('unsaved');
  isNotesUnsaved = true;

  if(allUserNotesCont.childElementCount >= 25) openAddNoteForm.style.display = 'none';
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
    isNotesUnsaved = true;

    if(localStorage.getItem('disabled-anim') === 'true') return renderNotesBlocks();

    noteBlock.classList.add('del-anim');
    clearTimeout(delNoteTimer);
    delNoteTimer = setTimeout(renderNotesBlocks, delAnimTime);
  }
  else if(e.target.closest('.fav-note-btn')) { // Favorite note block
    const noteName = e.target.closest('.note-block').firstElementChild.textContent;
    allNotesObj[noteName].isFav = !allNotesObj[noteName].isFav;

    renderNotesBlocks();

    noteSaveBtn.classList.add('unsaved');
    isNotesUnsaved = true;
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
userNotesText.addEventListener('input', e => {
  const lng = userNotesText.textContent.replaceAll('\n', '').length;

  if(lng > 2000) notesSymbolsLimitText.style.color = 'red';
  else notesSymbolsLimitText.style.color = 'var(--text-color)';

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
  btnsCont.append(delBtn, favBtn);

  delBtn.innerHTML = '<svg><use href="#delete-code"></use></svg>';
  delBtn.classList.add('delete-note-btn');

  favBtn.innerHTML = '<svg><use href="#favorite-icon"></use></svg>';
  favBtn.classList.add('fav-note-btn');
  favBtn.style.color = isFavorite ? 'rgb(255, 255, 122)' : 'white';
  favBtn.style.boxShadow = isFavorite ? '0 0 3px 1px gold' : '0 0 0 0 white';

  div.append(h2, hr, p, hr2, btnsCont);
  allUserNotesCont.appendChild(div);
}
let noteTxt = null;
function renderNotesText(name) {
  userNotesText.innerHTML = allNotesObj[name].txt.replaceAll('\n', '<br>');
  noteTxt = userNotesText.textContent;
  notesContentTitle.textContent = name;
  userNotesText.style.fontSize = `${localStorage.getItem('notes-font-size') || 1.2}rem`;
  notesContentWrap.classList.add('show');
  notesSymbolsLimitText.textContent = `${userNotesText.textContent.replaceAll('\n', '').length}/2000`;
}
function renderNotesBlocks() {
  allUserNotesCont.textContent = '';

  const arr = Object.keys(allNotesObj);

  if(!arr.length) {
    allUserNotesCont.textContent = '';
    noteProgress.value = 0;
    return notesBlocksLimitText.textContent = 'Notes: 0/25';
  }

  // Render favorite notes
  for(let name of arr) if(allNotesObj[name].isFav) createNoteBlock(name, allNotesObj[name].description, true);

  // Render no favorite notes
  for(let name of arr) if(!allNotesObj[name].isFav) createNoteBlock(name, allNotesObj[name].description, false);

  const notesBlocksLng = arr.length;
  noteProgress.value = notesBlocksLng;
  notesBlocksLimitText.textContent = `Notes: ${notesBlocksLng}/25`;
}

// Search note blocks
const searchNoteBlocksInput = notesWrap.querySelector('.search-note-blocks-input');
searchNoteBlocksInput.addEventListener('input', () => {
  const val = searchNoteBlocksInput.value.toLowerCase().trim();
  const safeVal = val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  allUserNotesCont.textContent = '';

  // Render favorite notes
  for(let n in allNotesObj) {
    const objInfo = allNotesObj[n];
    if(
      objInfo.isFav
      && (
        n.toLowerCase().includes(val)
        || objInfo.description.toLowerCase().includes(val)
      )
    ) createNoteBlock(n, allNotesObj[n].description, true, safeVal);
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
    ) createNoteBlock(n, allNotesObj[n].description, false, safeVal);
  }
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