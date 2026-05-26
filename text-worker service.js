const TEXT_WORKER_API = 'https://text-worker.vengernazar0.workers.dev/';

const textWorkerServiceWrap = document.querySelector('.text-worker-service-wrap');
// Open
const openTextWorkerServiceBtn = allDashboardItem.querySelector('.open-text-worker-service-wrap');
openTextWorkerServiceBtn.addEventListener('click', () => {
  closeAllWraps();
  textWorkerServiceWrap.classList.add('show');
})

const textWorkerServiceLoader = textWorkerServiceWrap.querySelector('.loader');

const userTxtForWorker = textWorkerServiceWrap.querySelector('.user-txt');
userTxtForWorker.addEventListener('input', () => userTxtForWorker.style.color = userTxtForWorker.value.trim().length <= 10_000 ? 'var(--text-color)' : 'red');

const generatedTxtFromWorker = textWorkerServiceWrap.querySelector('.generated-text');

const sendTextForTextWorkerBtn = textWorkerServiceWrap.querySelector('button');
sendTextForTextWorkerBtn.addEventListener('click', async () => {
  const text = userTxtForWorker.value.trim();
  if(!text) {
    showResponseFn('Please give text');
    return userTxtForWorker.focus();
  } else if(text.length > 10_000) return showResponseFn(`Your text is too long (${text.length}/10 000)`);

  sendTextForTextWorkerBtn.disabled = true;
  textWorkerServiceLoader.style.display = 'block';
  generatedTxtFromWorker.textContent = '';
  generatedTxtFromWorker.style.height = '30px';

  const resp = await fetch(TEXT_WORKER_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', "Authorization": userId },
    body: JSON.stringify({ text })
  });

  generatedTxtFromWorker.innerHTML = await resp.text();
  generatedTxtFromWorker.style.height = `${generatedTxtFromWorker.scrollHeight + 3}px`;

  sendTextForTextWorkerBtn.disabled = false;
  textWorkerServiceLoader.style.display = 'none';
})