const historyForUrlsAssistant = [];

// Urls assistant window
const urlsAssistantWindow = urlsWrap.querySelector('.urls-assistant-window');
// Toggle
urlsWrap.querySelector('.toggle-urls-assistant-window')
.addEventListener('click', () => urlsAssistantWindow.classList.toggle('open'));

const urlsAssistantAnswerContainer = urlsAssistantWindow.querySelector('.assistant-answer-container');

// Urls assistant loader
const urlsAssistantLoader = urlsAssistantWindow.querySelector('.assistant-loader');

// User prompt for urls assistant
const urlsAssistantPromptTextarea = urlsAssistantWindow.querySelector('.user-prompt-textarea');
urlsAssistantPromptTextarea.addEventListener('input', () => {
  urlsAssistantPromptTextarea.style.height = '30px';
  urlsAssistantPromptTextarea.style.height = `${urlsAssistantPromptTextarea.scrollHeight + 3}px`

  const val = urlsAssistantPromptTextarea.value.trim();
  sendUrlsAssistantPrompt.style.border = `1px solid ${val.length > 1000 ? 'red' : 'silver'}`;
  sendUrlsAssistantPrompt.textContent = val ? '=>' : '🗣';
})

const sendUrlsAssistantPrompt = urlsAssistantWindow.querySelector('.send-prompt-btn');
sendUrlsAssistantPrompt.addEventListener('click', async () => {
  const userTxt = urlsAssistantPromptTextarea.value.trim();
  if(!userTxt.length) return initSpeakWindow(urlsAssistantPromptTextarea);
  if(userTxt.length > 1000) return showResponseFn('Your question is too long (more than 1000 characters)');

  urlsAssistantPromptTextarea.value = '';
  urlsAssistantPromptTextarea.style.height = '30px';
  sendUrlsAssistantPrompt.textContent = '🗣';

  // Create user text
  const div = document.createElement('div'),
  pre = document.createElement('pre');

  div.classList.add('user-text');
  pre.textContent = userTxt;
  div.appendChild(pre);
  urlsAssistantAnswerContainer.appendChild(div);
  urlsAssistantAnswerContainer.scrollTop = urlsAssistantAnswerContainer.scrollHeight;
  // --------

  historyForUrlsAssistant.push({role: 'user', content: userTxt});
  if(historyForUrlsAssistant.length > 7) historyForUrlsAssistant.shift();

  let aiResp = await getUrlsAssistantResp();

  const setCommand = (aiResp.match(/\?set\|.+\|set\?/s) || '')[0];
  if(setCommand) {
    try {
      let setCommandArr = JSON.parse(setCommand.replace(/\?set\||\|set\?/g, ''));
      if(!Array.isArray(setCommandArr)) setCommandArr = [setCommandArr];
      initUndoActionBlock('urls', allUrlsObj);
      for(let obj of setCommandArr) setContent('urls', obj.name, obj.content);

      addUnsavedMarkAndRenderInitWrap();
      writeToUserActions('Дію зроблено url асистентом');
    } catch(e) {
      console.error(e);
      createUrlsAssistantResponse('Something went wrong, please try again later...');
    }
  }

  createUrlsAssistantResponse(aiResp);
})

// Create urls assistant response text
let urlsAssistantTypingInterval = null;
let initUrlsAssistantTypingEl = null;
let initUrlsAssistantTypingTxt = null;
function createUrlsAssistantResponse(txt) {
  if(urlsAssistantTypingInterval) {
    clearInterval(urlsAssistantTypingInterval);
    urlsAssistantTypingInterval = null;
    initUrlsAssistantTypingEl.textContent = initUrlsAssistantTypingTxt;
    urlsAssistantAnswerContainer.scrollTop = urlsAssistantAnswerContainer.scrollHeight;
  }

  const div = document.createElement('div')
  pre = document.createElement('pre');
  div.appendChild(pre);
  urlsAssistantAnswerContainer.appendChild(div);

  initUrlsAssistantTypingEl = pre;
  initUrlsAssistantTypingTxt = txt.replace(/\?set\|.+\|set\?/s, '• Done');
  const txtLng = initUrlsAssistantTypingTxt.length;

  historyForUrlsAssistant.push({role: 'assistant', content: txt});
  if(historyForUrlsAssistant.length > 7) historyForUrlsAssistant.shift();

  let c = 0;
  urlsAssistantTypingInterval = setInterval(() => {
    c += Math.floor(Math.random() * 5 + 1);
    initUrlsAssistantTypingEl.textContent = initUrlsAssistantTypingTxt.slice(0, c);
    urlsAssistantAnswerContainer.scrollTop = urlsAssistantAnswerContainer.scrollHeight;
    if(c > txtLng) {
      clearInterval(urlsAssistantTypingInterval);
      urlsAssistantTypingInterval = null;
      initUrlsAssistantTypingEl.textContent = initUrlsAssistantTypingTxt;
      urlsAssistantAnswerContainer.scrollTop = urlsAssistantAnswerContainer.scrollHeight;
    }
  }, 20);
}