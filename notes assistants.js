// NOTES ASSISTANT
const historyForNotesAssistant = [];

// Notes assistant
const notesAssistantWindow = notesWrap.querySelector('.notes-assistant-window');
// Toggle
notesWrap.querySelector('.toggle-notes-assistant-window')
.addEventListener('click', () => notesAssistantWindow.classList.toggle('open'));

const notesAssistantAnswerContainer = notesAssistantWindow.querySelector('.assistant-answer-container');

// Notes assistant loader
const notesAssistantLoader = notesAssistantWindow.querySelector('.assistant-loader');

// User prompt for notes assistant
const notesAssistantTextarea = notesAssistantWindow.querySelector('.user-prompt-textarea');
notesAssistantTextarea.addEventListener('input', () => {
  notesAssistantTextarea.style.height = '30px';
  notesAssistantTextarea.style.height = `${notesAssistantTextarea.scrollHeight + 3}px`;

  const val = notesAssistantTextarea.value.trim();
  sendNotesPromptBtn.style.border = `1px solid ${val.length > 1000 ? 'red' : 'silver'}`;
  sendNotesPromptBtn.textContent = val ? '=>' : '🗣';
})

const sendNotesPromptBtn = notesAssistantWindow.querySelector('.send-prompt-btn');
sendNotesPromptBtn.addEventListener('click', async () => {
  const userTxt = notesAssistantTextarea.value.trim();
  if(!userTxt) return initSpeakWindow(notesAssistantTextarea);
  if(userTxt.length > 1000) return showResponseFn('Your question is too long(more than 1000 characters)');

  notesAssistantTextarea.value = '';
  notesAssistantTextarea.style.height = '30px';
  sendNotesPromptBtn.textContent = '🗣';

  // Create user text
  const div = document.createElement('div'),
  pre = document.createElement('pre');

  div.classList.add('user-text');
  pre.textContent = userTxt;
  div.appendChild(pre);
  notesAssistantAnswerContainer.appendChild(div);
  notesAssistantAnswerContainer.scrollTop = notesAssistantAnswerContainer.scrollHeight;
  // ----

  historyForNotesAssistant.push({role: 'user', content: userTxt});
  if(historyForNotesAssistant.length > 7) historyForNotesAssistant.shift();

  let aiResp = await getNotesAssistantResp();

  const setCommand = (aiResp.match(/\?set\|.+\|set\?/s) || '')[0];
  if(setCommand) {
    try {
      let setCommandArr = JSON.parse(setCommand.replace(/\?set\||\|set\?/g, ''));
      if(!Array.isArray(setCommandArr)) setCommandArr = [setCommandArr];
      initUndoActionBlock('notes', allNotesObj);
      for(let obj of setCommandArr) setContent('notes', obj.name, obj.content);

      addUnsavedMarkAndRenderInitWrap();
      writeToUserActions('Дію зроблено note асистентом');
    } catch(e) {
      console.error(e);
      createNotesAssistantText('Something went wrong, please try again later...');
    }
  }

  createNotesAssistantText(aiResp);
})

// Create assistant response text
let notesAssistantTypingInterval = null;
let initNotesTypingEl = null;
let initNotesTypingTxt = null;
function createNotesAssistantText(txt) {
  if(notesAssistantTypingInterval) {
    clearInterval(notesAssistantTypingInterval);
    notesAssistantTypingInterval = null;
    initNotesTypingEl.textContent = initNotesTypingTxt;
    notesAssistantAnswerContainer.scrollTop = notesAssistantAnswerContainer.scrollHeight;
  }

  const div = document.createElement('div'),
  pre = document.createElement('pre');

  div.appendChild(pre);
  notesAssistantAnswerContainer.appendChild(div);

  initNotesTypingEl = pre;
  initNotesTypingTxt = txt.replace(/\?set\|.+\|set\?/s, '• Done');
  const txtLng = initNotesTypingTxt.length;

  historyForNotesAssistant.push({role: 'assistant', content: txt});
  if(historyForNotesAssistant.length > 7) historyForNotesAssistant.shift();

  let c = 0;
  notesAssistantTypingInterval = setInterval(() => {
    c += Math.floor(Math.random() * 5 + 1);
    initNotesTypingEl.textContent = initNotesTypingTxt.slice(0, c);
    notesAssistantAnswerContainer.scrollTop = notesAssistantAnswerContainer.scrollHeight;
    if(c > txtLng) {
      clearInterval(notesAssistantTypingInterval);
      notesAssistantTypingInterval = null;
      initNotesTypingEl.textContent = initNotesTypingTxt;
      notesAssistantAnswerContainer.scrollTop = notesAssistantAnswerContainer.scrollHeight;
    }
  }, 20);
}

// NOTES CONTENT ASSISTANT
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

  const aiResp = await getNotesContentAssistantResp(userNotesText.value.trim() || 'Пусто', notesContentTitle.textContent);
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