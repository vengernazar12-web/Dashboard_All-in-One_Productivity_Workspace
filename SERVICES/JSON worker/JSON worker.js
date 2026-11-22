const JSON_WORKER_API = 'https://json-worker.dark-backend.workers.dev';

const jsonWorkerWrap = document.querySelector('.json-worker-wrap');
// Open
const openJsonWorkerBtn = allDashboardItem.querySelector('.open-json-worker-wrap');
openJsonWorkerBtn.addEventListener('click', async () => {
  closeAllWraps();
  history.pushState({}, null, '#jsonWorker');

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

const jsonWorkerPaths = [];
const sendJsonWorkerBtn = jsonWorkerWrap.querySelector('button');
sendJsonWorkerBtn.addEventListener('click', () => {
  let json = userJsonTextareaWorker.value.trim();
  if (!json) return;

  try {
    json = JSON5.parse(json);
    try { json = JSON.parse(json); } catch {};

    const SCHEME_INFO = jsonWorkerRenderObject(json);

    const TABLE_INFO = `<table>
  <thead>
    <tr>
      <th>Path</th>
      <th>Value</th>
    </tr>
  </thead>

  <tbody>${jsonWorkerPaths.map(obj => `<tr><td>${obj.path}</td><td>${hashHtmlSymbols(obj.value)}</td></tr>`).join('')}</tbody>

  <tfoot><tr><td>Total jsonWorkerPaths</td><td>${jsonWorkerPaths.length}</td></tr></tfoot>
</table>`;

    const CSV_INFO = `Path|Value<br>
${jsonWorkerPaths.map(obj => `${obj.path}|${hashHtmlSymbols(obj.value)}<br>`).join('')}
Total paths|${jsonWorkerPaths.length}`;

    const result = `
<h3>Scheme:</h3>${SCHEME_INFO}

<hr>

<h3>paths table:</h3>${TABLE_INFO}

<br>

<h3>paths CSV:</h3>${CSV_INFO}

<br><hr>

<h3>Counter:</h3>
${jsonWorkerRenderObjectTypesCounter(json)}

<br><hr>

<h3>Minify:</h3>
<p>${JSON.stringify(json)}</p>
`.trim();

    jsonWorkerResultCont.innerHTML = result;
  } catch (e) {
    jsonWorkerResultCont.textContent = e.message;
    console.error(e);
  }
})

// -------------- RENDER LOGIC --------------
// Render scheme
function jsonWorkerRenderArray(arr, isStart = true, path = '') {
  let result = '';

  for(let [index, el] of arr.entries()) {
    const currentPath = hashHtmlSymbols(path ? `${path}[${index}]` : `$[${index}]`);

    const type = typeof el;

    // (!object && !array) || !el
    if(
      (
        type !== 'object'
        && !Array.isArray(el)
      ) || !el
    ) {
      result += `<p data-path='${currentPath}' style="text-shadow: 0 0 1px yellow">${hashHtmlSymbols(el)}</p>`;
      jsonWorkerPaths.push({ path: currentPath, value: el });
    }

    // If array
    else if(Array.isArray(el)) result += `
<details>
  <summary data-path='${currentPath}' style="text-shadow: 0 0 1px orange" data-for-close-state="[↤ ↦]" data-for-open-state="[↦ ↤]">Array</summary>
  ${jsonWorkerRenderArray(el, false, currentPath)}
</details>
`;

    // If object
    else if(type === 'object') result += `
<details>
  <summary data-path='${currentPath}' style="text-shadow: 0 0 1px orange" data-for-close-state="{↤ ↦}" data-for-open-state="{↦ ↤}">Object</summary>
  ${jsonWorkerRenderObject(el, false, currentPath)}
</details>
`;
}

  return isStart ? `<details open><summary style="text-shadow: 0 0 1px orange" data-for-close-state="[↤ ↦]" data-for-open-state="[↦ ↤]">Array</summary>${result}</details>` : result;
}

function jsonWorkerRenderObject(obj, isStart = true, path = '') {
  let result = '';

  for(let el in obj) {
    const currentPath = hashHtmlSymbols(path ? `${path}.${el}` : `$.${el}`);

    const type = typeof obj[el];
    // (!object && !array) || !obj[el]
    if(
      (
        type !== 'object'
        && !Array.isArray(obj[el])
      ) || !obj[el]
    ) {
      result += `<p data-path='${currentPath}'><span style="text-shadow: 0 0 1px yellow">${hashHtmlSymbols(el)} =</span> <span style="text-shadow: 0 0 1px yellowgreen; ${!obj[el] && type === 'string' ? 'opacity: 0.5' : ''}">${type === 'string' ? hashHtmlSymbols(obj[el]) || 'Empty' : hashHtmlSymbols(obj[el])}</span></p>`;
      jsonWorkerPaths.push({ path: currentPath, value: obj[el] });
    }

    // If array
    else if(Array.isArray(obj[el])) result += `
<details>
  <summary data-path='${currentPath}' style="text-shadow: 0 0 1px orange" data-for-close-state="[↤ ↦]" data-for-open-state="[↦ ↤]">${el} = [...]</summary>
  ${jsonWorkerRenderArray(obj[el], false, currentPath)}
</details>
`;

    // If object
    else if(type === 'object') result += `
<details>
  <summary data-path='${currentPath}' style="text-shadow: 0 0 1px orange" data-for-close-state="{↤ ↦}" data-for-open-state="{↦ ↤}">${el} = {...}</summary>
  ${jsonWorkerRenderObject(obj[el], false, currentPath)}
</details>
`;
  }

  return isStart ? `<details open><summary style="text-shadow: 0 0 1px orange" data-for-close-state="{↤ ↦}" data-for-open-state="{↦ ↤}">Object</summary>${result}</details>` : result;
}

// Types counter
function jsonWorkerRenderArrayTypesCounter(arr, oldCounter = {}, needContent = true) {
  const counterObj = oldCounter;

  for(let el of arr) {
    const type = typeof el;

    // string || number || boolean
    if(type === 'string' || type === 'number' || type === 'boolean') counterObj[type] = ( counterObj[type] || 0 ) + 1;

    // null
    else if(el === null) counterObj.null = ( counterObj.null || 0 ) + 1;

    // array
    else if(Array.isArray(el)) {
      counterObj.array = ( counterObj.array || 0 ) + 1
      jsonWorkerRenderArrayTypesCounter(el, counterObj, false);
    }

    // Object
    else if(type === 'object') {
      counterObj[type] = ( counterObj[type] || 0 ) + 1
      jsonWorkerRenderObjectTypesCounter(el, counterObj, false);
    }
  }

  return needContent ? Object.keys(counterObj).filter(k => counterObj[k]).map(k => `<p><span style="text-shadow: 0 0 2px green">${k}:</span> <span style="text-shadow: 0 0 2px blue">${counterObj[k]}</span></p>`).join('') : "";
}

function jsonWorkerRenderObjectTypesCounter(obj, oldCounter = {}, needContent = true) {
  const counterObj = oldCounter;

  for(let el in obj) {
    const type = typeof obj[el];

    // string || number || boolean
    if(type === 'string' || type === 'number' || type === 'boolean') counterObj[type] = ( counterObj[type] || 0 ) + 1;

    // null
    else if(obj[el] === null) counterObj.null = ( counterObj.null || 0 ) + 1;

    // array
    else if(Array.isArray(obj[el])) {
      counterObj.array = ( counterObj.array || 0 ) + 1
      jsonWorkerRenderArrayTypesCounter(obj[el], counterObj, false);
    }

    // object
    else if(type === 'object') {
      counterObj[type] = ( counterObj[type] || 0 ) + 1
      jsonWorkerRenderObjectTypesCounter(obj[el], counterObj, false);
    }
  }

  return needContent ? Object.keys(counterObj).filter(k => counterObj[k]).map(k => `<p><span style="text-shadow: 0 0 2px green">${k}:</span> <span style="text-shadow: 0 0 2px blue">${counterObj[k]}</span></p>`).join('') : "";
}