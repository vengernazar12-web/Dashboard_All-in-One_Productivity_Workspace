const todosAssistantWindow = todoWrap.querySelector('.todos-assistant-window');
// Toggle
todoWrap.querySelector('.toggle-todos-assistant-window')
.addEventListener('click', () => todosAssistantWindow.classList.toggle('open'));

const historyForTodosAssistant = [];

// Assistant answer container
const todosAssistantAnswerCont = todosAssistantWindow.querySelector('.assistant-answer-container');

// Todos assistant loader
const todosAssistantLoader = todosAssistantWindow.querySelector('.assistant-loader');

// User prompt textarea
const userTodosAssistantPromptTextarea = todosAssistantWindow.querySelector('.user-prompt-textarea');
userTodosAssistantPromptTextarea.addEventListener('input', () => {
  userTodosAssistantPromptTextarea.style.height = '30px';
  userTodosAssistantPromptTextarea.style.height = `${userTodosAssistantPromptTextarea.scrollHeight + 3}px`;

  sendTodosAssistantPromptBtn.style.border = `1px solid ${userTodosAssistantPromptTextarea.value.trim().length > 1000 ? 'red' : 'silver'}`
  sendTodosAssistantPromptBtn.textContent = userTodosAssistantPromptTextarea.value.trim() ? '=>' : '🗣';
})

// Send prompt
const sendTodosAssistantPromptBtn = todosAssistantWindow.querySelector('.send-prompt-btn');
sendTodosAssistantPromptBtn.addEventListener('click', async () => {
  const userTxt = userTodosAssistantPromptTextarea.value.trim();
  if(!userTxt.length) return initSpeakWindow(userTodosAssistantPromptTextarea);
  if(userTxt.length > 1000) return showResponseFn('Your question is too long (more than 1000 characters)');

  userTodosAssistantPromptTextarea.value = '';
  userTodosAssistantPromptTextarea.style.height = '30px';
  sendTodosAssistantPromptBtn.textContent = '🗣';

  // Create user text
  const div = document.createElement('div'),
  pre = document.createElement('pre');

  div.classList.add('user-text');
  pre.textContent = userTxt;
  div.appendChild(pre);
  todosAssistantAnswerCont.appendChild(div);
  todosAssistantAnswerCont.scrollTop = todosAssistantAnswerCont.scrollHeight;
  // ---------

  historyForTodosAssistant.push({role: 'user', content: userTxt});
  if(historyForTodosAssistant.length > 7) historyForTodosAssistant.shift();

  let aiResp = await getTodosAssistantResp();

  const setCommand = (aiResp.match(/\?set\|.+\|set\?/s) || '')[0];
  if(setCommand) {
    try {
      let setCommandArr = JSON.parse(setCommand.replace(/\?set\||\|set\?/g, ''));
      if(!Array.isArray(setCommandArr)) setCommandArr = [setCommandArr];
      initUndoActionBlock('todos', allTodosObj);
      for(let obj of setCommandArr) setContent('todos', obj.name, obj.content);

      addUnsavedMarkAndRenderInitWrap();
      writeToUserActions('Дію зроблено todo асистентом');
    } catch(e) {
      console.error(e);
      createTodosAssistantResponse('Something went wrong, please try again later...');
    }
  }

  createTodosAssistantResponse(aiResp);
})

// Create assistant resp
let todosTypingInterval = null;
let todosTypingElement = null;
let todosTypingText = null;
function createTodosAssistantResponse(txt) {
  if(todosTypingInterval) {
    clearInterval(todosTypingInterval);
    todosTypingElement.textContent = todosTypingText;
    todosAssistantAnswerCont.scrollTop = todosAssistantAnswerCont.scrollHeight;
    todosTypingInterval = null;
  };

  const div = document.createElement('div'),
  pre = document.createElement('pre');

  div.appendChild(pre);
  todosAssistantAnswerCont.appendChild(div);

  todosTypingElement = pre;
  todosTypingText = txt.replace(/\?set\|.+\|set\?/s, '• Done');
  const initTypingTextLng = todosTypingText.length;

  historyForTodosAssistant.push({role: 'assistant', content: txt});
  if(historyForTodosAssistant.length > 7) historyForTodosAssistant.shift();

  let c = 0;
  todosTypingInterval = setInterval(() => {
    c++;
    try {
      todosTypingElement.textContent = todosTypingText.slice(0, c);
      todosAssistantAnswerCont.scrollTop = todosAssistantAnswerCont.scrollHeight;
      if(c > initTypingTextLng) {
        clearInterval(todosTypingInterval);
        todosTypingInterval = null;
        todosTypingElement.textContent = todosTypingText;
      }
    } catch(e) { console.error(e); clearInterval(todosTypingInterval); }
  }, 20);
}