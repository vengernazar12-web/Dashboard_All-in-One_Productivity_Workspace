// Set preloader text
whatIsLoadingText.textContent = 'Loading assistants logic...';

// User actions
const userActionsForAi = [];

function writeToUserActions(val) {
  const d = new Date();
  const day = d.getDate();
  const hour = d.getHours();
  const minutes = d.getMinutes();
  const seconds = d.getSeconds();

  userActionsForAi.push(`${val} дня ${String(day).padStart(2, '0')} та час ${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
  if(userActionsForAi.length > 25) userActionsForAi.shift();
}

// Assistant wrap
const assistantWrap = document.querySelector('.assistant-wrap');
// Open
const openAssistantWrapBtn = allDashboardItem.querySelector('.open-assistant-wrap');
openAssistantWrapBtn.addEventListener('click', () => {
  closeAllWraps();
  assistantWrap.classList.add('show');
  userPromptTextarea.focus();
});

// Assistant loader
const assistantLoader = assistantWrap.querySelector('.assistant-loader');

// Assistant response container
let isRunGeneratedCommand = false;
const assistantResponseContainer = assistantWrap.querySelector('.assistant-answer-container');
assistantResponseContainer.addEventListener('click', async e => {
  const target = e.target;
  if(target.classList.contains('runner-command-btn')) {
    if(isRunGeneratedCommand) return;
    isRunGeneratedCommand = true;

    const cancelBtn = target.parentElement.querySelector('.cancel-command-btn');

    const command = target.dataset.command;
    const tool_id = target.dataset.toolId;

    target.disabled = true;
    cancelBtn.disabled = true;

    const commandResult = await goRunner(command);
    if(!commandResult.result.errors.length) delete commandResult.result.errors;

    const doActions = commandResult.result.do_action;
    if(doActions) doRunnerActions(doActions);
    delete commandResult.result.do_action;

    historyForAiPrompt.push({
      role: 'tool',
      tool_call_id: tool_id,
      content: unhashHtmlSymbols(JSON.stringify(commandResult.result).replace(/<\/?span>/g, ''))
    });

    target.remove();
    cancelBtn.remove();

    generatedCommandsCount--;

    isRunGeneratedCommand = false;

    if(generatedCommandsCount <= 0) {
      generatedCommandsCount = 0;
      assistantLoader.style.display = 'block';
      const aiResp = await getAiResponse();
      createAssistantResponse(aiResp);
    }
  }
  else if(target.classList.contains('cancel-command-btn')) {
    if(isRunGeneratedCommand) return;
    isRunGeneratedCommand = true;

    const runCommandBtn = target.parentElement.querySelector('.runner-command-btn');

    target.remove();
    runCommandBtn.remove();

    const tool_id = target.dataset.toolId;

    historyForAiPrompt.push({role: "tool", tool_call_id: tool_id, content: JSON.stringify({CANCEL_ERROR: 'The user rejected the command'})});

    generatedCommandsCount--;

    isRunGeneratedCommand = false;

    if(generatedCommandsCount <= 0) {
      generatedCommandsCount = 0;
      assistantLoader.style.display = 'block';
      const aiResp = await getAiResponse();
      createAssistantResponse(aiResp);
    }
  }
})

// User prompt textarea
const userPromptTextarea = assistantWrap.querySelector('.user-prompt-textarea');
userPromptTextarea.addEventListener('input', () => {
  userPromptTextarea.style.height = '30px';
  userPromptTextarea.style.height = `${userPromptTextarea.scrollHeight + 3}px`;

  const val = userPromptTextarea.value.trim();
  sendPromptBtn.style.border = `1px solid ${val.length > 1000 ? 'red' : 'silver'}`;
  sendPromptBtn.textContent = val ? '=>' : '🗣';
})

// Send prompt
const sendPromptBtn = assistantWrap.querySelector('.send-prompt-btn');
sendPromptBtn.addEventListener('click', async () => {
  const userTxt = userPromptTextarea.value.trim();
  if(!userTxt) return initSpeakWindow(userPromptTextarea);
  if(userTxt.length > 1000) return showResponseFn('Your question is too long (more than 1000 characters)');

  // Generate user text
  const userTaskDiv = document.createElement('div');
  const userTaskPre = document.createElement('pre');
  userTaskDiv.classList.add('user-text');
  userTaskPre.textContent = userPromptTextarea.value;
  userTaskDiv.appendChild(userTaskPre);
  assistantResponseContainer.appendChild(userTaskDiv);
  assistantResponseContainer.scrollTop = assistantResponseContainer.scrollHeight;
  // ------------

  historyForAiPrompt.push({role: 'user', content: userTxt});

  userPromptTextarea.value = '';
  userPromptTextarea.style.height = '30px';
  sendPromptBtn.textContent = '🗣';

  const aiResp = await getAiResponse();
  createAssistantResponse(aiResp);
})

// Create assistant response
let typingInterval = null;
let initTypingElement = null;
let initTypingText = null;
let initTypingHTML = null;

let isLastBeenThinking = false;

function createAssistantResponse(txt, isThinking = false) {
  if(typingInterval) {
    clearInterval(typingInterval);
    typingInterval = null;
    initTypingElement.innerHTML = initTypingHTML;
    assistantResponseContainer.scrollTop = assistantResponseContainer.scrollHeight;
  };

  if(isLastBeenThinking) {
    initTypingElement.textContent = '';

    if(!isThinking) {
      initTypingElement.classList.remove('thinking-ai-text');
      isLastBeenThinking = false;
    };
  }

  else {
    const div = document.createElement('div');
    const pre = document.createElement('pre');
    div.appendChild(pre);
    assistantResponseContainer.appendChild(div);
    initTypingElement = pre;
    if(isThinking) {
      pre.classList.add('thinking-ai-text');
      isLastBeenThinking = true;
    }
  }

  initTypingHTML = txt;
  initTypingText = new DOMParser().parseFromString((unhashHtmlSymbols(txt)), "text/html").body.textContent;;
  const txtLng = initTypingText.length;

  let c = 0;
  typingInterval = setInterval(() => {
    c += Math.floor(Math.random() * 6 + 1);
    initTypingElement.textContent = initTypingText.slice(0, c);
    assistantResponseContainer.scrollTop = assistantResponseContainer.scrollHeight;
    if(c > txtLng) {
      clearInterval(typingInterval);
      typingInterval = null;
      initTypingElement.innerHTML = initTypingHTML;
      assistantResponseContainer.scrollTop = assistantResponseContainer.scrollHeight;
    };
  }, isThinking ? 50 : 15);
}

// Memory for ai
const memoryForAiWindow = assistantWrap.querySelector('.memory-for-ai');
assistantWrap.querySelector('.open-memory-for-ai')
.addEventListener('click', () => {
  memoryForAiWindow.classList.toggle('show');
  memoryForAiTextarea.value = memoryForAi;
});

const memoryForAiTextarea = memoryForAiWindow.querySelector('textarea');
memoryForAiTextarea.addEventListener('input', () => memoryForAiTextarea.value = memoryForAiTextarea.value.slice(0, 150));

// Save memory for ai
memoryForAiWindow.querySelector('.save-memory-for-ai')
.addEventListener('click', async () => {
  memoryForAiWindow.classList.remove('show');

  if(memoryForAi !== memoryForAiTextarea.value) {
    showPreloader();
    preloaderProgress.max = 1;
    preloaderProgress.value = 0;
    whatIsLoadingText.textContent = 'Start...';

    const { error: tableErr} = await client
      .from('user_content')
      .update({memory: memoryForAiTextarea.value})
      .eq('id', userId);

    if(tableErr) {
      showResponseFn('Something went wrong. Please try again later...');
      return showPreloader(false);
    }

    preloaderProgress.value = 1;
    whatIsLoadingText.textContent = 'Saved';

    memoryForAi = memoryForAiTextarea.value;
    showResponseFn('Saved');
    setTimeout(() => showPreloader(false), 500);
  }
})

// Set preloader value
preloaderProgress.value = 14;