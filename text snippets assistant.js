const historyForTextSnippetsAssistant = [];

const textSnippetsAssistantWindow = textsSnippetsWrap.querySelector('.text-snippets-assistant-window');
// Toggle
textsSnippetsWrap.querySelector('.toggle-text-snippets-assistant-window')
.addEventListener('click', () => textSnippetsAssistantWindow.classList.toggle('open'));

const textSnippetsAssistantAnswerContainer = textSnippetsAssistantWindow.querySelector('.assistant-answer-container');
const textSnippetsAssistantLoader = textSnippetsAssistantWindow.querySelector('.assistant-loader');

// User prompt
const textSnippetsPromptTextarea = textSnippetsAssistantWindow.querySelector('.user-prompt-textarea');
textSnippetsPromptTextarea.addEventListener('input', () => {
  textSnippetsPromptTextarea.style.height = '30px';
  textSnippetsPromptTextarea.style.height = `${textSnippetsPromptTextarea.scrollHeight + 3}px`;

  sendTextSnippetsPromptBtn.style.border = `1px solid ${textSnippetsPromptTextarea.value.trim().length > 1000 ? 'red' : 'silver'}`;
})

const sendTextSnippetsPromptBtn = textSnippetsAssistantWindow.querySelector('.send-prompt-btn');
sendTextSnippetsPromptBtn.addEventListener('click', async () => {
  const userTxt = textSnippetsPromptTextarea.value.trim();
  if(!userTxt) return showResponseFn('Nothing to send');
  if(userTxt.length > 1000) return showResponseFn('Your question is too long (more than 1000 characters)');

  textSnippetsPromptTextarea.value = '';
  textSnippetsPromptTextarea.style.height = '30px';

  // Create user text
  const div = document.createElement('div'),
  pre = document.createElement('pre');

  div.classList.add('user-text');
  pre.textContent = userTxt;
  div.appendChild(pre);
  textSnippetsAssistantAnswerContainer.appendChild(div);
  textSnippetsAssistantWindow.scrollTop = textSnippetsAssistantWindow.scrollHeight;
  // -------

  historyForTextSnippetsAssistant.push({role: 'user', content: userTxt});
  if(historyForTextSnippetsAssistant.length > 7) historyForTextSnippetsAssistant.shift();

  let aiResp = await getTextsSnippetsAssistantResp();

  const setCommand = (aiResp.match(/\?set\|.+\|set\?/s) || '')[0];
  if(setCommand) {
    try {
      aiResp = aiResp.replace(setCommand, '• Done');
      let setCommandArr = JSON.parse(setCommand.replace(/\?set\||\|set\?/g, ''));
      if(!Array.isArray(setCommandArr)) setCommandArr = [setCommandArr];
      initUndoActionBlock('texts', allTextsSnippetsObj);
      for(let obj of setCommandArr) setContent('texts', obj.name, obj.content);

      addUnsavedMarkAndRenderInitWrap();
      writeToUserActions('Дію зроблено text-snippets асистентом');
    } catch(e) {
      console.error(e);
      createUrlsAssistantResponse('Something went wrong, please try again later...');
    }
  }

  createTextSnippetsAssistantResp(aiResp);
})

// Create codes assistant response text
let textSnippetsAssistantTypingInterval = null;
let initTextSnippetsAssistantTypingEl = null;
let initTextSnippetsAssistantTypingTxt = null;
function createTextSnippetsAssistantResp(txt) {
  if(textSnippetsAssistantTypingInterval) {
    clearInterval(textSnippetsAssistantTypingInterval);
    textSnippetsAssistantTypingInterval = null;
    initTextSnippetsAssistantTypingEl.textContent = initTextSnippetsAssistantTypingTxt;
    textSnippetsAssistantWindow.scrollTop = textSnippetsAssistantWindow.scrollHeight;
  }

  const div = document.createElement('div'),
  pre = document.createElement('pre');
  div.appendChild(pre);
  textSnippetsAssistantAnswerContainer.appendChild(div);

  initTextSnippetsAssistantTypingEl = pre;
  initTextSnippetsAssistantTypingTxt = txt;
  const txtLng = initTextSnippetsAssistantTypingTxt.length;

  historyForTextSnippetsAssistant.push({role: 'assistant', content: txt});
  if(historyForTextSnippetsAssistant.length > 7) historyForTextSnippetsAssistant.shift();

  let c = 0;
  textSnippetsAssistantTypingInterval = setInterval(() => {
    c += Math.floor(Math.random() * 5 + 1);
    initTextSnippetsAssistantTypingEl.textContent = initTextSnippetsAssistantTypingTxt.slice(0, c);
    textSnippetsAssistantWindow.scrollTop = textSnippetsAssistantWindow.scrollHeight;
    if(c > txtLng) {
      clearInterval(textSnippetsAssistantTypingInterval);
      textSnippetsAssistantTypingInterval = null;
      initTextSnippetsAssistantTypingEl.textContent = initTextSnippetsAssistantTypingTxt;
      textSnippetsAssistantWindow.scrollTop = textSnippetsAssistantWindow.scrollHeight;
    }
  }, 20);
}