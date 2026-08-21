const aiRouterWindow = document.querySelector('.ai-router-window');

const openAiRouterBtn = document.querySelector('button.open-router-ai');
const aiRouterDragAndDropInfo = {};
openAiRouterBtn.addEventListener('pointerdown', e => {
  aiRouterDragAndDropInfo.isDrag = true;
  aiRouterDragAndDropInfo.isDragAndDrop = false;

  const btnInfo = openAiRouterBtn.getBoundingClientRect();
  aiRouterDragAndDropInfo.btnInfo = btnInfo;

  aiRouterDragAndDropInfo.offsetX = e.clientX - btnInfo.left;
  aiRouterDragAndDropInfo.offsetY = e.clientY - btnInfo.top;

  openAiRouterBtn.setPointerCapture(e.pointerId);
});

openAiRouterBtn.addEventListener('pointermove', e => {
  if (!aiRouterDragAndDropInfo.isDrag) return;

  const left = e.clientX - aiRouterDragAndDropInfo.offsetX;
  const top = e.clientY - aiRouterDragAndDropInfo.offsetY;

  openAiRouterBtn.style.left = `${left}px`;
  openAiRouterBtn.style.top = `${top}px`;
});

openAiRouterBtn.addEventListener('pointerup', e => {
  aiRouterDragAndDropInfo.isDrag = false;
  openAiRouterBtn.releasePointerCapture(e.pointerId);
});

openAiRouterBtn.addEventListener('pointermove', e => {
  if (!aiRouterDragAndDropInfo.isDrag) return;

  const left = Math.max(0, e.clientX - aiRouterDragAndDropInfo.offsetX);
  const top = Math.max(0, e.clientY - aiRouterDragAndDropInfo.offsetY);

  const btnInfo = aiRouterDragAndDropInfo.btnInfo;

  openAiRouterBtn.style.left = `${Math.min(left, window.innerWidth - btnInfo.width)}px`;
  openAiRouterBtn.style.top = `${Math.min(top, window.innerHeight - btnInfo.height)}px`;

  aiRouterDragAndDropInfo.isDragAndDrop = true;
});

openAiRouterBtn.addEventListener('pointerup', e => {
  aiRouterDragAndDropInfo.isDrag = false;
  openAiRouterBtn.releasePointerCapture(e.pointerId);
});

openAiRouterBtn.addEventListener('click', () => {
  if(!aiRouterDragAndDropInfo.isDragAndDrop) aiRouterWindow.classList.toggle('open');
});

// Router AI logic
// AI history
const aiRouterHistory = [];

// Chat
const aiRouterChatContainer = aiRouterWindow.querySelector('div.chat');

const aiRouterUserTaskInput = aiRouterWindow.querySelector('input');
aiRouterUserTaskInput.addEventListener('input', () => aiRouterUserTaskInput.style.color = aiRouterUserTaskInput.value.trim() > 200 ? 'red' : 'var(--text-color)');

const aiRouterSendTaskBtn = aiRouterWindow.querySelector('button');
aiRouterSendTaskBtn.addEventListener('click', async () => {
  const value = aiRouterUserTaskInput.value.trim();
  if(value.length > 200) return showResponse('Your message is too long (>200)');

  aiRouterHistory.push({ role: 'user', content: value });

  const userPre = document.createElement('pre');
  userPre.classList.add('user');
  userPre.textContent = value;
  aiRouterChatContainer.appendChild(userPre);

  aiRouterChatContainer.scrollTop = aiRouterChatContainer.scrollHeight;

  aiRouterSendTaskBtn.disabled = true;
  aiRouterUserTaskInput.disabled = true;

  const openedWindow = location.hash?.slice(1) || 'No window has been opened yet';

  try {
    const aiMessage = await fetch('https://dashboard-router-ai.dark-backend.workers.dev/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history: aiRouterHistory, initWindow: openedWindow })
    }).then(r => r.json());

    const aiText = aiMessage.message;
    const forHist = aiMessage.for_history;
    const aiOpen = aiMessage.open;

    if(aiOpen) dashboardWindowsBtnsFromNames[aiOpen]?.click();

    const aiPre = document.createElement('pre');
    aiPre.classList.add('is-ai-text');
    aiPre.innerHTML = `${aiOpen ? `<small>⇒ ${aiOpen}</small>\n\n` : ''}${aiText}`;
    aiRouterChatContainer.appendChild(aiPre);

    aiRouterChatContainer.scrollTop = aiRouterChatContainer.scrollHeight;

    aiRouterHistory.push({ role: 'assistant', content: forHist });
  } catch(e) {
    showResponseFn(`Error: ${e.message}`);
    console.log(e);
  } finally {
    aiRouterSendTaskBtn.disabled = false;
    aiRouterUserTaskInput.disabled = false;
    aiRouterUserTaskInput.value = '';
  }
})