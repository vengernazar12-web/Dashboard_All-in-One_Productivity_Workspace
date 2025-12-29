let time = null;
const btnSaveNotes = document.querySelector('[data-save-text]');
const notesWrap = document.querySelector('.notes-wrap');
const textBlock = document.querySelector('[data-notes-text-block]');

const notesLimitNumber = document.querySelector('.notes-symbols-limit-text');

const btnReloadNotesTags = document.querySelector('.reload-all-notes-tags');
btnReloadNotesTags.addEventListener('click', reloadNotes);

function reloadNotes() {
  textBlock.innerHTML = textBlock.innerHTML.replace(/<\/?mark>/g, '');
  searchWordsInNotes.value = '';
}

const searchWordsInNotes = document.querySelector('.search-text-in-notes');
searchWordsInNotes.addEventListener('focusin', () => btnSaveNotes.click());
searchWordsInNotes.addEventListener('focusout', reloadNotes);

searchWordsInNotes.addEventListener('input', e => {
  const search = e.target.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if(!search.length) return textBlock.innerHTML = userObj.content.notes;

  textBlock.innerHTML = userObj.content.notes
  .replace(new RegExp(`(?<!<[^>]{0,10})${search}(?![^<]{0,10}>)`, 'gi'), '<mark>$&</mark>');
});

document.querySelector('.btn-up')
.addEventListener('click', () => textBlock.scrollTop = 0);
document.querySelector('.btn-down')
.addEventListener('click', () => textBlock.scrollTop = textBlock.scrollHeight);

textBlock.addEventListener('input', () => {
  const lng = textBlock.textContent.replace(/\n/g, '').length;
  notesLimitNumber.textContent = `${lng}/2500`;
  if(lng > 2500) btnSaveNotes.disabled = true;
  else btnSaveNotes.disabled = false;
})