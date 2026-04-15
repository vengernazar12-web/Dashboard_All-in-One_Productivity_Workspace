const historyForNotesContentAssistant = [];

// Notes content assistant
const notesContentAssistantWindow = notesContentWrap.querySelector('.notes-content-assistant-window');
// Toggle
notesContentWrap.querySelector('.toggle-notes-content-assistant-window')
.addEventListener('click', () => notesContentAssistantWindow.classList.toggle('open'));

const notesContentAssistantAnswerContainer = notesContentAssistantWindow.querySelector('.assistant-answer-container');

// Notes content assistant loader
const notesContentAssistantLoader = notesContentAssistantWindow.querySelector('.assistant-loader');

// User prompt for notes CONTENT assistant
const notesContentAssistantTextarea = notesContentAssistantWindow.querySelector('.user-prompt-textarea');
notesContentAssistantTextarea.addEventListener('input', () => {
  notesContentAssistantTextarea.style.height = '30px';
  notesContentAssistantTextarea.style.height = `${notesContentAssistantTextarea.scrollHeight + 3}px`;

  const val = notesContentAssistantTextarea.value.trim();
  sendNotesContentPromptBtn.style.border = `1px solid ${val.length > 1000 ? 'red' : 'silver'}`;
  sendNotesContentPromptBtn.textContent = val ? '=>' : '🗣';
})

const sendNotesContentPromptBtn = notesContentAssistantWindow.querySelector('.send-prompt-btn');
sendNotesContentPromptBtn.addEventListener('click', async () => {
  const userTxt = notesContentAssistantTextarea.value.trim();
  if(!userTxt) return initSpeakWindow(notesContentAssistantTextarea);
  if(userTxt.length > 1000) return showResponseFn('Your question is too long(more than 1000 characters)');

  notesContentAssistantTextarea.value = '';
  notesContentAssistantTextarea.style.height = '30px';
  sendNotesContentPromptBtn.textContent = '🗣';

  // Create user text
  const div = document.createElement('div'),
  pre = document.createElement('pre');

  div.classList.add('user-text');
  pre.textContent = userTxt;
  div.appendChild(pre);
  notesContentAssistantAnswerContainer.appendChild(div);
  notesContentAssistantAnswerContainer.scrollTop = notesContentAssistantAnswerContainer.scrollHeight;
  // -----

  historyForNotesContentAssistant.push({role: 'user', content: userTxt});
  if(historyForNotesContentAssistant.length > 5) historyForNotesContentAssistant.shift();

  const aiResp = await getNotesContentAssistantResp(userNotesText.innerText.trim() || 'Пусто', notesContentTitle.textContent);
  createNotesContentAssistantText(aiResp);
})

// Create assistant response text
let notesContentAssistantTypingInterval = null;
let initNotesContentTypingEl = null;
let initNotesContentTypingTxt = null;
function createNotesContentAssistantText(txt) {
  if(notesContentAssistantTypingInterval) {
    clearInterval(notesContentAssistantTypingInterval);
    notesContentAssistantTypingInterval = null;
    initNotesContentTypingEl.textContent = initNotesContentTypingTxt;
    notesContentAssistantAnswerContainer.scrollTop = notesContentAssistantAnswerContainer.scrollHeight;
  }

  const div = document.createElement('div'),
  pre = document.createElement('pre');

  div.appendChild(pre);
  notesContentAssistantAnswerContainer.appendChild(div);

  initNotesContentTypingEl = pre;
  initNotesContentTypingTxt = txt;
  const txtLng = initNotesContentTypingTxt.length;

  historyForNotesContentAssistant.push({role: 'assistant', content: txt});
  if(historyForNotesContentAssistant.length > 5) historyForNotesContentAssistant.shift();

  let c = 0;
  notesContentAssistantTypingInterval = setInterval(() => {
    c += Math.floor(Math.random() * 5 + 1);
    initNotesContentTypingEl.textContent = initNotesContentTypingTxt.slice(0, c);
    notesContentAssistantAnswerContainer.scrollTop = notesContentAssistantAnswerContainer.scrollHeight;
    if(c > txtLng) {
      clearInterval(notesContentAssistantTypingInterval);
      notesContentAssistantTypingInterval = null;
      initNotesContentTypingEl.textContent = initNotesContentTypingTxt;
      notesContentAssistantAnswerContainer.scrollTop = notesContentAssistantAnswerContainer.scrollHeight;
    }
  }, 20);
}