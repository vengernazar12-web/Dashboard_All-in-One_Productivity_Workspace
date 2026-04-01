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

  const val = textSnippetsPromptTextarea.value.trim();
  sendTextSnippetsPromptBtn.style.border = `1px solid ${val.length > 1000 ? 'red' : 'silver'}`;
  sendTextSnippetsPromptBtn.textContent = val ? '=>' : '🗣';
})

const sendTextSnippetsPromptBtn = textSnippetsAssistantWindow.querySelector('.send-prompt-btn');
sendTextSnippetsPromptBtn.addEventListener('click', async () => {
  const userTxt = textSnippetsPromptTextarea.value.trim();
  if(!userTxt) return initSpeakWindow(textSnippetsPromptTextarea);
  if(userTxt.length > 1000) return showResponseFn('Your question is too long (more than 1000 characters)');

  textSnippetsPromptTextarea.value = '';
  textSnippetsPromptTextarea.style.height = '30px';
  sendTextSnippetsPromptBtn.textContent = '🗣';

  // Create user text
  const div = document.createElement('div'),
  pre = document.createElement('pre');

  div.classList.add('user-text');
  pre.textContent = userTxt;
  div.appendChild(pre);
  textSnippetsAssistantAnswerContainer.appendChild(div);
  textSnippetsAssistantAnswerContainer.scrollTop = textSnippetsAssistantAnswerContainer.scrollHeight;
  // -------

  historyForTextSnippetsAssistant.push({role: 'user', content: userTxt});
  if(historyForTextSnippetsAssistant.length > 7) historyForTextSnippetsAssistant.shift();

  let aiResp = await getTextsSnippetsAssistantResp();

  const setCommand = (aiResp.match(/\?set\|.+\|set\?/s) || '')[0];
  if(setCommand) {
    try {
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

// Create text snippets assistant response text
let textSnippetsAssistantTypingInterval = null;
let initTextSnippetsAssistantTypingEl = null;
let initTextSnippetsAssistantTypingTxt = null;
function createTextSnippetsAssistantResp(txt) {
  if(textSnippetsAssistantTypingInterval) {
    clearInterval(textSnippetsAssistantTypingInterval);
    textSnippetsAssistantTypingInterval = null;
    initTextSnippetsAssistantTypingEl.textContent = initTextSnippetsAssistantTypingTxt;
    textSnippetsAssistantAnswerContainer.scrollTop = textSnippetsAssistantAnswerContainer.scrollHeight;
  }

  const div = document.createElement('div'),
  pre = document.createElement('pre');
  div.appendChild(pre);
  textSnippetsAssistantAnswerContainer.appendChild(div);

  initTextSnippetsAssistantTypingEl = pre;
  initTextSnippetsAssistantTypingTxt = txt.replace(/\?set\|.+\|set\?/s, '• Done');
  const txtLng = initTextSnippetsAssistantTypingTxt.length;

  historyForTextSnippetsAssistant.push({role: 'assistant', content: txt});
  if(historyForTextSnippetsAssistant.length > 7) historyForTextSnippetsAssistant.shift();

  let c = 0;
  textSnippetsAssistantTypingInterval = setInterval(() => {
    c += Math.floor(Math.random() * 5 + 1);
    initTextSnippetsAssistantTypingEl.textContent = initTextSnippetsAssistantTypingTxt.slice(0, c);
    textSnippetsAssistantAnswerContainer.scrollTop = textSnippetsAssistantAnswerContainer.scrollHeight;
    if(c > txtLng) {
      clearInterval(textSnippetsAssistantTypingInterval);
      textSnippetsAssistantTypingInterval = null;
      initTextSnippetsAssistantTypingEl.textContent = initTextSnippetsAssistantTypingTxt;
      textSnippetsAssistantAnswerContainer.scrollTop = textSnippetsAssistantAnswerContainer.scrollHeight;
    }
  }, 20);
}