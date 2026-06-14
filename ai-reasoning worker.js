const AI_REASONING_WORKER_API = 'https://resoning-ai-worker.vengernazar0.workers.dev';

const reasoningAiHistory = [];

const reasoningAiWrap = document.querySelector('.reasoning-ai-wrap');
reasoningAiWrap.addEventListener('click', e => {
  if(!e.target.closest('.history')) reasoningAiHistoryCont.classList.remove('open');
})
// Open
const openReasoningAiBtn = allDashboardItem.querySelector('.open-reasoning-ai-wrap');
openReasoningAiBtn.addEventListener('click', async () => {
  closeAllWraps();
  if(needPushState) history.pushState({}, null, '#reasoning-ai');
  reasoningAiWrap.classList.add('show');
})

const reasoningAiLoader = reasoningAiWrap.querySelector('.loader');

const reasoningAiUserTaskTextarea = reasoningAiWrap.querySelector('textarea');
const reasoningAiResultCont = reasoningAiWrap.querySelector('.ai-resp');

const reasoningImgInput = reasoningAiWrap.querySelector('input');

const reasoningAiSendTaskBtn = reasoningAiWrap.querySelector('button.send');
reasoningAiSendTaskBtn.addEventListener('click', async () => {
  const userAsk = reasoningAiUserTaskTextarea.value.trim();
  if(!userAsk) return;
  if(userAsk.length > 15_000) return showResponseFn('Task is too long (more 15 000 symbols)');

  try {
    reasoningAiLoader.style.display = 'block';
    reasoningAiSendTaskBtn.disabled = true;

    reasoningAiHistory.push({ role: 'user', content: userAsk });

    reasoningAiResultCont.textContent = '';

    const resp = await fetch(AI_REASONING_WORKER_API, {
      method: 'POST',
      headers: { 'Authorization': userId },
      body: JSON.stringify({ history: reasoningAiHistory }),
    });
    const data = await resp.json();

    reasoningAiResultCont.innerHTML = data.for_show;

    reasoningAiHistory.push({ role: 'assistant', content: data.for_hist });
  } catch (e) { showResponseFn(`Error: ${e.message}`); console.error(e); };

  reasoningAiLoader.style.display = 'none';
  reasoningAiSendTaskBtn.disabled = false;
})

// History
const reasoningAiHistoryCont = reasoningAiWrap.querySelector('div.history');
// Open reasoning history
reasoningAiWrap.querySelector('button.history')
.addEventListener('click', () => {
  reasoningAiHistoryCont.textContent = '';
  reasoningAiHistoryCont.classList.add('open');

  if(!reasoningAiHistory.length) return reasoningAiHistoryCont.innerHTML = "<h3>You don't have any history yet</h3>";

  const frag = document.createDocumentFragment();
  for(let obj of reasoningAiHistory) {
    const pre = document.createElement('pre');

    if(obj.role === 'user') {
      pre.textContent = obj.content;
      pre.classList.add('user');
    }
    else pre.innerHTML = obj.content;

    frag.appendChild(pre);
  }

  reasoningAiHistoryCont.appendChild(frag);
});