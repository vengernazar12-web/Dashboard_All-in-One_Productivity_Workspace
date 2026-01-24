const notesWrap = document.querySelector('.notes-wrap');
notesWrap.addEventListener('click', () => deleteNoteConfirmBlock.classList.remove('show'));
document.querySelector('.open-notes-wrap')
.addEventListener('click', () => {
  showPreloader();
  renderNotesBlocks();
  notesWrap.classList.add('show');
  if(allUserNotesCont.childElementCount >= 5) openAddNoteForm.style.display = 'none';
  showPreloader(false);
  const noteLng = Object.keys(allNotesObj).length;
  noteProgress.value = noteLng;
  notesBlocksLimitText.textContent = `Notes: ${noteLng}/15`;
})
document.querySelector('.close-notes-wrap')
.addEventListener('click', () => notesWrap.classList.remove('show'))

document.querySelector('.close-notes-content-wrap')
.addEventListener('click', e => {
  const name = notesContentTitle.textContent;
  allNotesObj[name].txt = userNotesText.innerText;
  showResponseFn(`Save "${name}" note text`);
  noteSaveBtn.classList.add('unsaved');
  notesContentWrap.classList.remove('show');
});
let allNotesObj = {};

/* Note progress */ const noteProgress = notesWrap.querySelector('.note-progress');

// Add note form
const addNotesForm = notesWrap.querySelector('.add-notes-inputs');
const addNoteInputName = addNotesForm.querySelector('.note-name-input');
const addNoteInputDescription = addNotesForm.querySelector('.note-description-input');

const addNotesButton = addNotesForm.querySelector('.add-note-button');
addNotesButton.addEventListener('click', () => {
  const notesBlocksLng = Object.keys(allNotesObj).length;
  if(notesBlocksLng >= 15) return showResponseFn('Your have note blocks limit');
  const name = addNoteInputName.value.trim();
  const desc = addNoteInputDescription.value.trim();

  if(!name) {addNotesForm.classList.remove('show'); return showResponseFn("You don't have a note name !")};
  if(allNotesObj[name]) return showResponseFn('You are using this name');

  addNoteInputName.value = '';
  addNoteInputDescription.value = '';
  addNotesForm.classList.remove('show');

  allNotesObj[name] = { description: desc, txt: '' };

  generateNoteBlock( name, desc );
  noteSaveBtn.classList.add('unsaved');

  if(allUserNotesCont.childElementCount >= 15) return openAddNoteForm.style.display = 'none';

  noteProgress.value = notesBlocksLng + 1;
  notesBlocksLimitText.textContent = `Notes: ${notesBlocksLng + 1}/15`;
})

const openAddNoteForm = notesWrap.querySelector('.toggle-add-note-form');
openAddNoteForm.addEventListener('click', () => {
  if(allUserNotesCont.childElementCount >= 15) {
    openAddNoteForm.style.display = 'none';
    return showResponseFn('You have max notes 15/15');
  };
  addNotesForm.classList.toggle('show');
  addNoteInputName.focus();
})

/* Limits texts */
const notesSymbolsLimitText = notesWrap.querySelector('.notes-symbols-limit-text');
const notesBlocksLimitText = notesWrap.querySelector('.notes-blocks-limit');

const notesContentWrap = document.querySelector('.notes-content-wrap');
const notesContentTitle = notesContentWrap.querySelector('h3');

const userNotesText = notesContentWrap.querySelector('.notes-user-content');
userNotesText.addEventListener('input', e => {
  const lng = userNotesText.textContent.replaceAll('\n', '').length;
  if(lng > 1500) notesSymbolsLimitText.style.color = 'red';
  else notesSymbolsLimitText.style.color = 'black';
  notesSymbolsLimitText.textContent = `${lng}/1500`;
})

const allUserNotesCont = document.querySelector('.all-user-notes-container');
allUserNotesCont.addEventListener('click', e => {
  if(e.target.closest('.user-note-block')) {
    const name = e.target.closest('.user-note-block').firstElementChild.textContent;
    renderNotesText(name);
    notesContentTitle.textContent = name;
    userNotesText.style.fontSize = `${localStorage.getItem('notes-font-size') || 1.2}rem`;
    notesContentWrap.classList.add('show');
    notesSymbolsLimitText.textContent = `${userNotesText.textContent.replaceAll('\n', '').length}/1500`;
  }
})

// Delete note
let touchTime = null, longPress = false;

let deleteTargetBlock = null;
const deleteNoteConfirmBlock = document.querySelector('.delete-note-confirm');

allUserNotesCont.addEventListener('touchstart', e => {
  if(e.target.closest('.user-note-block')) {
    deleteNoteConfirmBlock.classList.remove('show');
    const left = Math.min(e.changedTouches[0].clientX, window.innerWidth - deleteNoteConfirmBlock.offsetWidth);
    const top = Math.min(e.changedTouches[0].clientY, window.innerHeight - deleteNoteConfirmBlock.offsetHeight);
    touchTime = setTimeout(() => {
      longPress = true;
      deleteNoteConfirmBlock.style.left = `${left}px`;
      deleteNoteConfirmBlock.style.top = `${top}px`;
    }, 300);
  }
}, { passive: false })
allUserNotesCont.addEventListener('touchmove', () => {clearTimeout(touchTime); longPress = false;}, { passive: false });
allUserNotesCont.addEventListener('touchend', e => {
  longPress = false;
  clearTimeout(touchTime);
  if(longPress) return;
  if(e.target.closest('.user-note-block')) {
    const left = Math.min(e.changedTouches[0].clientX, window.innerWidth - deleteNoteConfirmBlock.offsetWidth);
    const top = Math.min(e.changedTouches[0].clientY, window.innerHeight - deleteNoteConfirmBlock.offsetHeight);
  }
})

allUserNotesCont.addEventListener('contextmenu', e => {
  if(e.target.closest('.user-note-block')) {
    e.preventDefault();
    deleteNoteConfirmBlock.classList.remove('show');

    deleteNoteConfirmBlock.classList.add('show');

    deleteNoteConfirmBlock.style.left = Math.min(e.clientX, window.innerWidth - deleteNoteConfirmBlock.offsetWidth) + 'px';
    deleteNoteConfirmBlock.style.top = Math.min(e.clientY, window.innerHeight - deleteNoteConfirmBlock.offsetHeight) + 'px';

    deleteTargetBlock = e.target.closest('.user-note-block');
  }
})

deleteNoteConfirmBlock.querySelector('button').addEventListener('click', () => {
  if(!deleteTargetBlock) return;
  const name = deleteTargetBlock.querySelector('h2').textContent;
  delete allNotesObj[name];
  allUserNotesCont.textContent = '';
  Object.keys(allNotesObj).forEach(note => generateNoteBlock(note, allNotesObj[note].description));
  noteSaveBtn.classList.add('unsaved');

  deleteNoteConfirmBlock.classList.remove('show');
  openAddNoteForm.style.display = 'inline';

  const notesBlocksLng = Object.keys(allNotesObj).length;
  noteProgress.value = notesBlocksLng;
  notesBlocksLimitText.textContent = `Notes: ${notesBlocksLng}/15`;
})

function renderNotesText(name) { userNotesText.innerHTML = allNotesObj[name].txt.replaceAll('\n', '<br>'); }
function generateNoteBlock( name, desc ) {
  const div = document.createElement('div'),
  h2 = document.createElement('h2'),
  p = document.createElement('p');

  h2.textContent = name;
  p.textContent = desc;

  div.append(h2, p);
  div.classList.add('user-note-block');

  allUserNotesCont.appendChild(div);
}
function renderNotesBlocks() {
  allUserNotesCont.textContent = '';
  for(let name of Object.keys(allNotesObj)) generateNoteBlock(name, allNotesObj[name].description);
}

const searchNoteTextInput = document.querySelector('.search-note-text-input');

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