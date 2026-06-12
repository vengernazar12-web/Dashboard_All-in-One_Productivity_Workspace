const JSON_WORKER_API = 'https://json-worker.vengernazar0.workers.dev';

const jsonWorkerWrap = document.querySelector('.json-worker-wrap');
// Open
const openJsonWorkerBtn = allDashboardItem.querySelector('.open-json-worker-wrap');
openJsonWorkerBtn.addEventListener('click', async () => {
  closeAllWraps();
  if(needPushState) history.pushState({}, null, '#json-worker');

  if(!isJson5Loaded) {
    preloaderProgress.max = 1;
    preloaderProgress.value = 0;
    whatIsLoadingText.textContent = 'Loading JSON5';
    showPreloader();

    await loadScript("https://unpkg.com/json5/dist/index.min.js");
    isJson5Loaded = true;

    preloaderProgress.value = 1;
    setTimeout(() => showPreloader(false), 500);
  }

  jsonWorkerWrap.classList.add('show');
})

const jsonWorkerLoader = jsonWorkerWrap.querySelector('.loader');

const userJsonTextareaWorker = jsonWorkerWrap.querySelector('textarea');

const jsonWorkerResultCont = jsonWorkerWrap.querySelector('div');
jsonWorkerResultCont.addEventListener('click', e => {
  const target = e.target;
  const closestElDataPath = target.closest('[data-path]');

  if(closestElDataPath) {
    const path = unhashHtmlSymbols(closestElDataPath.dataset.path);
    navigator.clipboard.writeText(path);
    showResponseFn(`${path} copied`);
  }
})

const searchJsonTreeInput = jsonWorkerWrap.querySelector('input');
searchJsonTreeInput.addEventListener('input', () => {
  const value = searchJsonTreeInput.value.trim();

  for(const el of jsonWorkerResultCont.querySelectorAll("details:first-of-type details")) el.open = false;

  if(!value) return;

  const foundElements = jsonWorkerResultCont.querySelectorAll("details:first-of-type *:not(details)");
  if(!foundElements.length) return showResponseFn('Nothing found');

  let foundEl = null;
  for(let el of foundElements) if(el.textContent.toLowerCase().includes(value.toLowerCase())) { foundEl = el; break; };

  if(!foundEl) return showResponseFn('Nothing found');
  let parentEl = foundEl.closest('details');
  while(parentEl?.tagName === 'DETAILS') {
    parentEl.open = true;
    parentEl = parentEl.parentElement;
  }

  foundEl.classList.remove('found-json-el-anim');
  void foundEl.offsetWidth;
  foundEl.classList.add('found-json-el-anim');

  requestAnimationFrame(() => jsonWorkerResultCont.scrollTop = foundEl.offsetTop - 100);
})

const sendJsonWorkerBtn = jsonWorkerWrap.querySelector('button');
sendJsonWorkerBtn.addEventListener('click', async () => {
  let json = userJsonTextareaWorker.value.trim();
  if (!json) return;

  jsonWorkerLoader.style.display = 'block';
  sendJsonWorkerBtn.disabled = true;

  try {
    json = JSON5.parse(json);

    const resp = await fetch(JSON_WORKER_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify({ jsonContent: JSON.stringify(json) })
    });
    const data = await resp.text();

    jsonWorkerResultCont.innerHTML = data;

    jsonWorkerLoader.style.display = 'none';
    sendJsonWorkerBtn.disabled = false;
  } catch (e) {
    showResponseFn(`Error: ${e}`);
    console.error(e);
    jsonWorkerLoader.style.display = 'none';
    sendJsonWorkerBtn.disabled = false;
  }
})