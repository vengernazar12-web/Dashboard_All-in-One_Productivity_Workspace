const fetchServiceWrap = document.querySelector('.fetch-service-wrap');
fetchServiceWrap.addEventListener('click', e => {
  const target = e.target;
  const closestDeleteFieldBtn = target.closest('.close');
  if(closestDeleteFieldBtn) closestDeleteFieldBtn.parentElement.remove();
})
// Open
const openFetchServiceBtn = allDashboardItem.querySelector('.open-fetch-service-wrap');
openFetchServiceBtn.addEventListener('click', () => {
  closeAllWraps();
  fetchServiceWrap.classList.add('show');
})

const fetchServiceLoader = fetchServiceWrap.querySelector('.loader');

const fetchServiceUrlInput = fetchServiceWrap.querySelector('input.url');
const fetchServiceMethodSelect = fetchServiceWrap.querySelector('.method');

const fetchServiceHeaders = fetchServiceWrap.querySelector('.headers');
const addFetchServiceHeaderBtn = fetchServiceHeaders.querySelector('.add');
addFetchServiceHeaderBtn.addEventListener('click', () => {
  const block = getFetchServiceBlock();
  fetchServiceHeaders.appendChild(block);
  block.firstElementChild.focus();
})

const fetchServiceBody = fetchServiceWrap.querySelector('.body');
const addFetchServiceBodyBtn = fetchServiceBody.querySelector('.add');
addFetchServiceBodyBtn.addEventListener('click', () => {
  const block = getFetchServiceBlock(true);
  fetchServiceBody.appendChild(block);
  block.firstElementChild.focus();
})

const fetchServiceResultCont = fetchServiceWrap.querySelector('.result');

let controller;
const fetchServiceBtn = fetchServiceWrap.querySelector('button.fetch');
fetchServiceBtn.addEventListener('click', async () => {
  const url = fetchServiceUrlInput.value.trim();
  if(!url) {
    showResponseFn('Please enter a URL');
    return fetchServiceUrlInput.focus();
  } else if(url.length > 500) {
    showResponseFn('Your URL is too long (>500 symbols)');
    return fetchServiceUrlInput.focus();
  }

  fetchServiceLoader.style.display = 'block';
  fetchServiceBtn.disabled = true;

  const method = fetchServiceMethodSelect.value || 'GET';

  const headers = {};
  for(const block of fetchServiceHeaders.querySelectorAll('.field-block')) {
    const key = block.querySelector('.key')?.value;
    const value = block.querySelector('.value')?.value;
    headers[key] = value;
  }

  const body = {};
  for(const block of fetchServiceBody.querySelectorAll('.field-block')) {
    const key = block.querySelector('.key')?.value;
    const value = block.querySelector('.value')?.value;
    body[key] = value;
  }

  const d = Date.now();

  try { // Fetch
    controller = new AbortController();

    const resp = await fetch(url.startsWith('http') ? url : `https://${url}`, {
      method, headers,
      body: Object.keys(body).length ? JSON.stringify(body) : undefined,
      signal: controller.signal
    });

    const ok = resp.ok, status = resp.status;
    const respHeaders = JSON.stringify(Object.fromEntries(resp.headers.entries()), null, 2);
    const time = ((Date.now() - d) / 1000).toFixed(3);

    const responseMetaTxt = `Ok: ${ok}
Status: ${status}
Final URL: ${resp.url}
Redirected: ${resp.redirected}
Type: ${resp.type}
Time: ${time}s
<details><summary>Headers</summary>${respHeaders.slice(1, -1)}</details>

`;
    const contentType = (resp.headers.get("content-type") || "").split(';')[0]?.toLowerCase();

    if( // If audio/video/image
      contentType.includes('audio/')
      || contentType.includes('video/')
      || contentType.includes('image/')
      || (contentType.includes('application/') && !contentType.includes('/json'))
    ) {
      const url = URL.createObjectURL(await resp.blob());
      setTimeout(() => URL.revokeObjectURL(url), 200_000);

      const elementHTML = contentType.includes('audio/')
      ? `<audio src="${url}" controls></audio>`
      : contentType.includes('video/')
      ? `<video src='${url}' controls style='width: 100%; height: auto'></video>`
      : contentType.includes('image/')
      ? `<img src='${url}' style='max-width: 100%'>`
      : '';

      return fetchServiceResultCont.innerHTML = `${responseMetaTxt}${elementHTML}
\n<a download='DASHBOARD_FETCH_SERVICE_FILE' href="${url}">DOWNLOAD</a>`;
    }

    let text = await resp.text();
    try {
      const parsed = JSON.parse(text);
      if(typeof parsed === 'object') text = JSON.stringify(parsed, null, 2);
    } catch {};

    fetchServiceResultCont.textContent = `${responseMetaTxt}${text}`;
  } catch (e) { fetchServiceResultCont.textContent = `Error: ${e.name}: ${e.message}` }
  finally {
    fetchServiceLoader.style.display = 'none';
    fetchServiceBtn.disabled = false;
    controller = undefined;
  }
})

// Abort fetch btn
fetchServiceWrap.querySelector('.abort')
.addEventListener('click', () => controller?.abort());

function getFetchServiceBlock(needTextarea = false) {
  const div = document.createElement('div');
  const inputKey = document.createElement('input');
  const valueField = document.createElement(needTextarea ? 'textarea' : 'input');
  const closeBtn = document.createElement('button');

  div.classList.add('field-block');
  div.append(inputKey, valueField, closeBtn);

  inputKey.type = 'text';
  inputKey.classList.add('key');
  inputKey.placeholder = 'Key...';

  if(!needTextarea) valueField.type = 'text';
  else { // If textarea
    valueField.style.height = '30px';
    valueField.rows = 1;
    valueField.addEventListener('input', e => {
      const target = e.target;
      target.style.height = '30px';
      target.style.height = `${target.scrollHeight + 5}px`;
    })
  }
  valueField.classList.add('value');
  valueField.placeholder = 'Value...';

  closeBtn.innerHTML = '<svg><use href="#delete-code"></use></svg>';
  closeBtn.classList.add('close');

  return div;
}