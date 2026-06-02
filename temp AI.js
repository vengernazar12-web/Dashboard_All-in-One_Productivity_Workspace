const TEMP_AI_WORKER_API = 'https://templater-ai.vengernazar0.workers.dev';

const tempAiWrap = document.querySelector('.template-ai-wrap');
// Open
const openTempAiBtn = allDashboardItem.querySelector('.open-template-ai-wrap');
openTempAiBtn.addEventListener('click', () => {
  closeAllWraps();
  tempAiWrap.classList.add('show');
})

const tempAiLoader = tempAiWrap.querySelector('.loader');

const tempAiUserTaskTextarea = tempAiWrap.querySelector('textarea');

const tempAiResponseCont = tempAiWrap.querySelector('div');
tempAiResponseCont.addEventListener('blur', e => {
  const target = e.target;
  if(target.tagName === 'SPAN' && !target.textContent.trim()) target.textContent = target.dataset.temp;
}, true);

const tempAiBtn = tempAiWrap.querySelector('button.send');
tempAiBtn.addEventListener('click', async () => {
  const userTask = tempAiUserTaskTextarea.value.trim();
  if(!userTask) return;
  if(userTask.length > 15_000) return showResponseFn('Your message is too long (> 15 000 symbols)');

  try {
    tempAiBtn.disabled = true;
    tempAiLoader.style.display = 'block';

    const resp = await fetch(TEMP_AI_WORKER_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify({ userTask, userId })
    });
    const data = await resp.text();

    tempAiResponseCont.innerHTML = data;
  } catch(e) { showResponseFn(e.message); }
  finally {
    tempAiBtn.disabled = false;
    tempAiLoader.style.display = 'none';
  }
});
// Copy btn
tempAiWrap.querySelector('button.copy')
.addEventListener('click', () => {
  navigator.clipboard.writeText(tempAiResponseCont.textContent || '...');
  showResponseFn('Copied');
});