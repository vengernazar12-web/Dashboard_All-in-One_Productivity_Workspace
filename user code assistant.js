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

  const val = codesContentAssistantPromptTextarea.value.trim();
  sendCodesContentAssistantPromptBtn.style.border = `1px solid ${val.length > 1000 ? 'red' : 'silver'}`;
  sendCodesContentAssistantPromptBtn.textContent = val ? '=>' : '🗣';
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