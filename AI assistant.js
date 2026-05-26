// Set preloader text
whatIsLoadingText.textContent = 'Loading assistant logic...';

const HISTORY_WORKER_API = 'https://assistant-history.vengernazar0.workers.dev';

// User actions
const userActionsForAi = [];

async function renderHistoryChat() {
  showPreloader();
  preloaderProgress.max = 1;
  preloaderProgress.value = 0;
  whatIsLoadingText.textContent = 'Start loading history...';

  try {
    const resp = await fetch(HISTORY_WORKER_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', "Authorization": userId },
      body: JSON.stringify({ isGetChat: true })
    });
    const data = await resp.json();
    historyForAiPrompt = data.for_history;

    const frag = document.createDocumentFragment();
    for (let obj of data.for_show || []) {
      const div = document.createElement('div');
      const pre = document.createElement('pre');
      div.appendChild(pre);

      const role = obj.role;
      const content = obj.content;

      if (role === 'user') {
        div.classList.add('user-text');
        pre.innerHTML = content;
      } else if (role === 'assistant' && content) pre.innerHTML = content;
      else continue;

      frag.appendChild(div);
    }

    assistantResponseContainer.textContent = '';
    assistantResponseContainer.appendChild(frag);

    preloaderProgress.value = 1;
    setTimeout(() => {
      assistantResponseContainer.scrollTop = assistantResponseContainer.scrollHeight;
      showPreloader(false);
    }, 500);
  } catch (e) { showResponseFn(`Error: ${e.message}`); console.error(e); }
}

// Assistant wrap
const assistantWrap = document.querySelector('.assistant-wrap');
// Open
const openAssistantWrapBtn = allDashboardItem.querySelector('.open-assistant-wrap');
openAssistantWrapBtn.addEventListener('click', async () => {
  closeAllWraps();
  if(!historyForAiPrompt || historyForAiPrompt.length > 100) await renderHistoryChat();

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
      type: "function_call_output",
      call_id: tool_id,
      output: unhashHtmlSymbols(JSON.stringify(commandResult.result).replace(/<\/?span>/g, ''))
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

    historyForAiPrompt.push({
      type: "function_call_output",
      call_id: tool_id,
      output: JSON.stringify({ success: ["Command run...", "Cancelled: the user rejected the given command"] })
    });

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
  if(!txt) return;

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
  if(isThinking) {
    initTypingElement.innerHTML = initTypingHTML;
    assistantResponseContainer.scrollTop = assistantResponseContainer.scrollHeight;
    return;
  }

  initTypingText = new DOMParser().parseFromString((unhashHtmlSymbols(txt)), "text/html").body.textContent;
  const txtLng = initTypingText.length;

  let c = 0;
  typingInterval = setInterval(() => {
    c += Math.floor(Math.random() * 10 + 1);
    initTypingElement.textContent = initTypingText.slice(0, c);
    if(c > txtLng) {
      clearInterval(typingInterval);
      typingInterval = null;
      initTypingElement.innerHTML = initTypingHTML;
    };
  }, 25);
}

// Set preloader value
preloaderProgress.value = 3;