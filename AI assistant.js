// Set preloader text
whatIsLoadingText.textContent = 'Loading assistant logic...';

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
allDashboardItem.querySelector('.open-assistant-wrap')
.addEventListener('click', () => {
  closeAllWraps();
  assistantWrap.classList.add('show');
  userPromptTextarea.focus();
});

// Assistant loader
const assistantLoader = assistantWrap.querySelector('.assistant-loader');

// Assistant response container
const assistantResponseContainer = assistantWrap.querySelector('.assistant-answer-container');

// User prompt textarea
const userPromptTextarea = assistantWrap.querySelector('.user-prompt-textarea');
userPromptTextarea.addEventListener('input', () => {
  userPromptTextarea.style.height = '30px';
  userPromptTextarea.style.height = `${userPromptTextarea.scrollHeight + 3}px`;

  sendPromptBtn.style.border = `1px solid ${userPromptTextarea.value.trim().length > 1000 ? 'red' : 'silver'}`;
  sendPromptBtn.textContent = userPromptTextarea.value.trim() ? '=>' : '🗣';
})

// Send prompt
const sendPromptBtn = assistantWrap.querySelector('.send-prompt-btn');
sendPromptBtn.addEventListener('click', async () => {
  const userTxt = userPromptTextarea.value.trim();
  if(!userTxt) {
    initVoiceTextarea = userPromptTextarea;
    speakWindow.classList.add('show');
    return recognition.start();
  }
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
  if(historyForAiPrompt.length > 9) historyForAiPrompt.shift();

  userPromptTextarea.value = '';
  userPromptTextarea.style.height = '30px';
  sendPromptBtn.textContent = '🗣';

  useAiResp();
})

// Create assistant response
let typingInterval = null;
let initTypingElement = null;
let initTypingText = null;

function createAssistantResponse(txt) {
  if(typingInterval) {
    clearInterval(typingInterval);
    typingInterval = null;
    initTypingElement.textContent = initTypingText;
    assistantResponseContainer.scrollTop = assistantResponseContainer.scrollHeight;
  };

  const div = document.createElement('div');
  const pre = document.createElement('pre');
  div.appendChild(pre);
  assistantResponseContainer.appendChild(div);

  initTypingElement = pre;
  initTypingText = txt.replace(/(?:\n|^)\?get\|[^\n]+/gi, '• Get...');
  const txtLng = initTypingText.length;

  historyForAiPrompt.push({role: "assistant", content: txt});
  if(historyForAiPrompt.length > 9) historyForAiPrompt.shift();

  let c = 0;
  typingInterval = setInterval(() => {
    c += Math.floor(Math.random() * 5 + 1);
    initTypingElement.textContent = initTypingText.slice(0, c);
    assistantResponseContainer.scrollTop = assistantResponseContainer.scrollHeight;
    if(c > txtLng) {
      clearInterval(typingInterval);
      typingInterval = null;
      initTypingElement.textContent = initTypingText;
      assistantResponseContainer.scrollTop = assistantResponseContainer.scrollHeight;
    };
  }, 20);
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

    const { data, error } = await client.auth.getSession();
    if(error) {
      showResponseFn('Something went wrong. Please try again later...');
      return showPreloader(false);
    }

    const id = data.session.user.id;

    const { error: tableErr} = await client
      .from('user_content')
      .update({memory: memoryForAiTextarea.value})
      .eq('id', id);

    if(tableErr) {
      showResponseFn('Something went wrong. Please try again later...');
      return showPreloader(false);
    }

    memoryForAi = memoryForAiTextarea.value;
    showResponseFn('Saved');
    showPreloader(false);
  }
})

// Set preloader value
preloaderProgress.value = 12;