// USER CODES ASSISTANT
const historyForCodesAssistant = [];

const codesAssistantWindow = userCodeWrap.querySelector('.codes-assistant-window');
// Toggle
userCodeWrap.querySelector('.toggle-codes-assistant-window')
.addEventListener('click', () => codesAssistantWindow.classList.toggle('open'));

const codesAssistantAnswerContainer = codesAssistantWindow.querySelector('.assistant-answer-container');

// Codes assistant loader
const codesAssistantLoader = codesAssistantWindow.querySelector('.assistant-loader');

// User prompt
const codesAssistantPromptTextarea = codesAssistantWindow.querySelector('.user-prompt-textarea');
codesAssistantPromptTextarea.addEventListener('input', () => {
  codesAssistantPromptTextarea.style.height = '30px';
  codesAssistantPromptTextarea.style.height = `${codesAssistantPromptTextarea.scrollHeight + 3}px`;

  sendCodesAssistantPromptBtn.style.border = `1px solid ${codesAssistantPromptTextarea.value.trim().length > 1000 ? 'red' : 'silver'}`;
  sendCodesAssistantPromptBtn.textContent = codesAssistantPromptTextarea.value.trim() ? '=>' : '🗣';
})

const sendCodesAssistantPromptBtn = codesAssistantWindow.querySelector('.send-prompt-btn');
sendCodesAssistantPromptBtn.addEventListener('click', async () => {
  const userTxt = codesAssistantPromptTextarea.value.trim();
  if(!userTxt.length) return initSpeakWindow(codesAssistantPromptTextarea);
  if(userTxt.length > 1000) return showResponseFn('Your question is too long (more than 1000 characters)');

  codesAssistantPromptTextarea.value = '';
  codesAssistantPromptTextarea.style.height = '30px';
  sendCodesAssistantPromptBtn.textContent = '🗣';

  // Create user text
  const div = document.createElement('div'),
  pre = document.createElement('pre');

  div.classList.add('user-text');
  pre.textContent = userTxt;
  div.appendChild(pre);
  codesAssistantAnswerContainer.appendChild(div);
  codesAssistantWindow.scrollTop = codesAssistantWindow.scrollHeight;
  // -------

  historyForCodesAssistant.push({role: 'user', content: userTxt});
  if(historyForCodesAssistant.length > 7) historyForCodesAssistant.shift();

  let aiResp = await getCodesAssistantResp();

  const setCommand = (aiResp.match(/\?set\|.+\|set\?/s) || '')[0];
  if(setCommand) {
    try {
      aiResp = aiResp.replace(setCommand, '• Done');
      let setCommandArr = JSON.parse(setCommand.replace(/\?set\||\|set\?/g, ''));
      if(!Array.isArray(setCommandArr)) setCommandArr = [setCommandArr];
      initUndoActionBlock('codes', allUserCodesObj);
      for(let obj of setCommandArr) setContent('codes', obj.name, obj.content);

      addUnsavedMarkAndRenderInitWrap();
      writeToUserActions('Дію зроблено code асистентом');
    } catch(e) {
      console.error(e);
      createUrlsAssistantResponse('Something went wrong, please try again later...');
    }
  }

  createCodesAssistantResp(aiResp);
})

// Create codes assistant response text
let codesAssistantTypingInterval = null;
let initCodesAssistantTypingEl = null;
let initCodesAssistantTypingTxt = null;
function createCodesAssistantResp(txt) {
  if(codesAssistantTypingInterval) {
    clearInterval(codesAssistantTypingInterval);
    codesAssistantTypingInterval = null;
    initCodesAssistantTypingEl.textContent = initCodesAssistantTypingTxt;
    codesAssistantWindow.scrollTop = codesAssistantWindow.scrollHeight;
  }

  const div = document.createElement('div'),
  pre = document.createElement('pre');
  div.appendChild(pre);
  codesAssistantAnswerContainer.appendChild(div);

  initCodesAssistantTypingEl = pre;
  initCodesAssistantTypingTxt = txt;
  const txtLng = initCodesAssistantTypingTxt.length;

  historyForCodesAssistant.push({role: 'assistant', content: txt});
  if(historyForCodesAssistant.length > 7) historyForCodesAssistant.shift();

  let c = 0;
  codesAssistantTypingInterval = setInterval(() => {
    c += Math.floor(Math.random() * 5 + 1);
    initCodesAssistantTypingEl.textContent = initCodesAssistantTypingTxt.slice(0, c);
    codesAssistantWindow.scrollTop = codesAssistantWindow.scrollHeight;
    if(c > txtLng) {
      clearInterval(codesAssistantTypingInterval);
      codesAssistantTypingInterval = null;
      initCodesAssistantTypingEl.textContent = initCodesAssistantTypingTxt;
      codesAssistantWindow.scrollTop = codesAssistantWindow.scrollHeight;
    }
  }, 20);
}

// CODES CONTENT ASSISTANT
const historyForCodesContentAssistant = [];

const codesContentAssistantWindow = focusWrap.querySelector('.codes-content-assistant-window');
// Toggle in file 'user code.js'(delegation for 'focusWrap')

const codesContentAssistantAnswerContainer = codesContentAssistantWindow.querySelector('.assistant-answer-container');

// Codes content assistant loader
const codesContentAssistantLoader = codesContentAssistantWindow.querySelector('.assistant-loader');

// User prompt for codes CONTENT assistant
const codesContentAssistantPromptTextarea = codesContentAssistantWindow.querySelector('.user-prompt-textarea');
codesContentAssistantPromptTextarea.addEventListener('input', () => {
  codesContentAssistantPromptTextarea.style.height = '30px';
  codesContentAssistantPromptTextarea.style.height = `${codesContentAssistantPromptTextarea.scrollHeight + 3}px`;

  sendCodesContentAssistantPromptBtn.style.border = `1px solid ${codesContentAssistantPromptTextarea.value.trim().length > 1000 ? 'red' : 'silver'}`;
  sendCodesContentAssistantPromptBtn.textContent = codesContentAssistantPromptTextarea.value.trim() ? '=>' : '🗣';
})

const sendCodesContentAssistantPromptBtn = codesContentAssistantWindow.querySelector('.send-prompt-btn');
sendCodesContentAssistantPromptBtn.addEventListener('click', async () => {
  const userTxt = codesContentAssistantPromptTextarea.value.trim();
  if(!userTxt.length) return initSpeakWindow(codesContentAssistantPromptTextarea);
  if(userTxt.length > 1000) return showResponseFn('Your question is too long (more than 1000 characters)');

  codesContentAssistantPromptTextarea.value = '';
  codesContentAssistantPromptTextarea.style.height = '30px';
  sendCodesContentAssistantPromptBtn.textContent = '🗣';

  // Create user text
  const div = document.createElement('div'),
  pre = document.createElement('pre');
  div.classList.add('user-text');
  pre.textContent = userTxt;
  div.appendChild(pre);
  codesContentAssistantAnswerContainer.appendChild(div);
  codesContentAssistantAnswerContainer.scrollTop = codesContentAssistantAnswerContainer.scrollHeight;
  // -----

  historyForCodesContentAssistant.push({role: 'user', content: userTxt});
  if(historyForCodesContentAssistant.length > 5) historyForCodesContentAssistant.shift();

  const aiResp = await getCodesContentAssistantResp();
  createCodesContentAssistantText(aiResp);
})

// Create codes content assistant response text
let userCodesContentTypingInterval = null;
let initCodesContentAssistantTypingEl = null;
let initCodesContentAssistantTypingTxt = null;
function createCodesContentAssistantText(txt) {
  if(userCodesContentTypingInterval) {
    clearInterval(userCodesContentTypingInterval);
    userCodesContentTypingInterval = null;
    initCodesContentAssistantTypingEl.textContent = initCodesContentAssistantTypingTxt;
    codesContentAssistantAnswerContainer.scrollTop = codesContentAssistantAnswerContainer.scrollHeight;
  }

  const div = document.createElement('div'),
  pre = document.createElement('pre');

  div.appendChild(pre);
  codesContentAssistantAnswerContainer.appendChild(div);

  initCodesContentAssistantTypingEl = pre;
  initCodesContentAssistantTypingTxt = txt;
  const txtLng = initCodesContentAssistantTypingTxt.length;

  historyForCodesContentAssistant.push({role: 'assistant', content: txt});
  if(historyForCodesContentAssistant.length > 5) historyForCodesContentAssistant.shift();

  let c = 0;
  userCodesContentTypingInterval = setInterval(() => {
    c += Math.floor(Math.random() * 5 + 1);
    initCodesContentAssistantTypingEl.textContent = initCodesContentAssistantTypingTxt.slice(0, c);
    codesContentAssistantAnswerContainer.scrollTop = codesContentAssistantAnswerContainer.scrollHeight;
    if(c > txtLng) {
      clearInterval(userCodesContentTypingInterval);
      userCodesContentTypingInterval = null;
      initCodesContentAssistantTypingEl.textContent = initCodesContentAssistantTypingTxt;
      codesContentAssistantAnswerContainer.scrollTop = codesContentAssistantAnswerContainer.scrollHeight;
    }
  }, 20);
}