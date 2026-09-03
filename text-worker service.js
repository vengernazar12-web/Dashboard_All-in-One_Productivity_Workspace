const textWorkerServiceWrap = document.querySelector('.text-worker-service-wrap');
textWorkerServiceWrap.addEventListener('click', e => {
  const target = e.target;
  const closestContainer = target.closest('div.cont');

  for(const cont of textWorkerServiceWrap.children) if(cont.classList.contains('cont')) cont.classList.remove('open');

  if(closestContainer) { closestContainer.classList.add('open'); }
})
// Open
const openTextWorkerServiceBtn = allDashboardItem.querySelector('.open-text-worker-service-wrap');
openTextWorkerServiceBtn.addEventListener('click', () => {
  closeAllWraps();
  history.pushState({}, null, '#textWorker');
  textWorkerServiceWrap.classList.add('show');
})

// AI text worker
const TEXT_WORKER_API = 'https://text-worker.dark-backend.workers.dev';

const textWorkerAiCount = textWorkerServiceWrap.querySelector('div.ai');
const textWorkerServiceLoader = textWorkerAiCount.querySelector('.loader');

const textWorkerAiTextarea = textWorkerAiCount.querySelector('textarea');
textWorkerAiTextarea.addEventListener('input', () => textWorkerAiTextarea.style.color = textWorkerAiTextarea.value.trim().length <= 10_000 ? 'var(--text-color)' : 'red');

const textWorkerAiResult = textWorkerAiCount.querySelector('.is-ai-text');

const textWorkerAiSendBtn = textWorkerAiCount.querySelector('button');
textWorkerAiSendBtn.addEventListener('click', async () => {
  const text = textWorkerAiTextarea.value.trim();
  if(!text) {
    showResponseFn('Please give text');
    return textWorkerAiTextarea.focus();
  } else if(text.length > 10_000) return showResponseFn(`Your text is too long (${text.length}/10 000)`);

  textWorkerAiSendBtn.disabled = true;
  textWorkerServiceLoader.style.display = 'block';
  textWorkerAiResult.textContent = '';

  const resp = await fetch(TEXT_WORKER_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', "Authorization": userId },
    body: JSON.stringify({ text })
  });

  textWorkerAiResult.innerHTML = await resp.text();

  textWorkerAiSendBtn.disabled = false;
  textWorkerServiceLoader.style.display = 'none';
})

// Text cloner
const textWorkerClonerCont = textWorkerServiceWrap.querySelector('div.cloner');
const textWorkerClonerTextarea = textWorkerClonerCont.querySelector('textarea');
const textWorkerClonerCountInput = textWorkerClonerCont.querySelector('input');
const textWorkerClonerResult = textWorkerClonerCont.querySelector('div');

const textWorkerClonerBtn = textWorkerClonerCont.querySelector('button.send');
textWorkerClonerBtn.addEventListener('click', () => {
  const text = textWorkerClonerTextarea.value;
  const countVal = textWorkerClonerCountInput.value;

  let count = isNaN(countVal) ? 0 : Math.round(Math.abs(+countVal));
  if(count > 15000) return showResponseFn('Enter a number less than 15000');

  try {
    const arr = [];

    while(count > 0) {
      arr.push(text);
      count--;
    }

    textWorkerClonerResult.textContent = arr.join('\n');
  } catch {
    textWorkerClonerResult.textContent = '';
    showResponseFn('Text is too long...');
  }
})

const textWorkerClonerCopyBtn = textWorkerClonerCont.querySelector('button.copy');
textWorkerClonerCopyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(textWorkerClonerResult.textContent);
  showResponseFn('Copied');
})

// Text info
const textWorkerInfoCont = textWorkerServiceWrap.querySelector('div.info');
const textWorkerInfoResult = textWorkerInfoCont.querySelector('div');

const textWorkerInfoTextarea = textWorkerInfoCont.querySelector('textarea');
textWorkerInfoTextarea.addEventListener('input', () => {
  const val = textWorkerInfoTextarea.value;

  const characters = val.length;
  const lines = val.split(/\n+/);
  let spaces = 0;

  const allWords = [];

  const allWordsLng = [];

  const uniqueWordsObj = {};

  const urls = [];
  const numbers = [];
  const emails = [];
  const phones = [];

  let letters = 0;
  let digits = 0;
  let symbols = 0;
  let symbolsForStopInReadingTime = 0;

  let shortestWord = '';
  let longestWord = '';

  for(const line of lines) {
    // Push words and length and add to unique words count and set longest/shortest words
    for(const word of line.trim().replace(/[^\p{L}\p{N}]+/gu, ' ').toLowerCase().split(/\s+/)) {
      if(word) allWords.push(word);
      allWordsLng.push(word.length);
      uniqueWordsObj[word] = (uniqueWordsObj[word] || 0) + 1;

      if(!shortestWord && word) shortestWord = word;

      if(word && word.length > longestWord.length) longestWord = word;
      else if(word && word.length < shortestWord.length) shortestWord = word;
    };

    spaces += line.match(/ /g)?.length ?? 0;

    // Push urls
    for(const url of line.match(/\bhttps?:\/\/?[^\s]+/g) || []) urls.push(url);
    // Push numbers
    for(const num of line.match(/-?\d+(?:[.,]+\d+)?/g) || []) numbers.push(num);
    // Push emails
    for(const email of line.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi) || []) emails.push(email);
    // Push phones
    for(const phone of line.match(/\+?[\d \(\)\-.]+/g) || []) {
      const brackets = phone.replace(/[^\(\)]/g, '');
      if(brackets.length && brackets.length !== 2) continue;

      if(phone.match(/\- *\-/) || phone.indexOf('-') !== phone.lastIndexOf('-')) continue;

      const phoneNorm = phone.replace(/[^\d]+/g, '');
      if(phoneNorm.length <= 15 && phoneNorm.length >= 8) phones.push(phone);
    }

    // Add letters and digits and symbols and sentence symbols
    letters += line.match(/\p{L}/gu)?.length ?? 0;
    digits += line.match(/\d/g)?.length ?? 0;
    symbols += line.match(/[^\p{L}\p{N}\s]/gu)?.length ?? 0;
    // .,?!=@+\-\/*%<>$¥€₽₨₴¼⅓½⅔¾⅕⅖⅗⅙⅚⅛⅜⅞⅑⅘⅐⅝⅒∼≃≂≈≅≠≥≤ is reading symbols, people read this symbols
    symbolsForStopInReadingTime += line.match(/[.,?!=@+\-\/*%<>$¥€₽₨₴¼⅓½⅔¾⅕⅖⅗⅙⅚⅛⅜⅞⅑⅘⅐⅝⅒∼≃≂≈≅≠≥≤]+/g)?.length ?? 0;
  }

  const uniqueWordsArr = Object.keys(uniqueWordsObj).filter(Boolean);

  const bytes = new Blob([val]).size, kb = bytes / 1024, mb = bytes / (1024 * 1024);

  textWorkerInfoResult.innerHTML = `
Characters: ${characters}
<div class='progress-info' style='color: #22c55e'>Letters: ${letters}<progress max='${characters}' value='${letters}'></progress></div>
<div class='progress-info' style='color: #3b82f6'>Digits: ${digits}<progress max='${characters}' value='${digits}'></progress></div>
<div class='progress-info' style='color: #f59e0b'>Spaces: ${spaces}<progress max='${characters}' value='${spaces}'></progress></div>
<div class='progress-info' style='color: #ef4444'>Symbols: ${symbols}<progress max='${characters}' value='${symbols}'></progress></div>
Characters without spaces: ${characters - spaces}
Words: ${allWords.length}
Average word length: ${allWordsLng.reduce((a,b) => a+b, 0) / allWordsLng.length}
Lines: ${val ? lines.length : 0}

Reading time ≈ ${val.trim() ? (allWordsLng.reduce((a,b) => a + ( b <= 4 ? 0.35 : b <= 8 ? 0.6 : b <= 12 ? 0.75 : 0.9 ), 0) + symbolsForStopInReadingTime / 3.5).toFixed(2) : 0}s

Shortest word: ${shortestWord || 'Nothing...'} (${shortestWord.length})
Longest word: ${longestWord || 'Nothing...'} (${longestWord.length})

Unique words (${uniqueWordsArr.length}): ${uniqueWordsArr.length ? `<details>${uniqueWordsArr.map(w => `${w} - ${uniqueWordsObj[w]}`).join('\n')}</details>` : 'Nothing...'}
URLS (${urls?.length || 0}): ${urls.length ? `<details>${urls.join('\n').trim()}</details>` : 'Nothing...'}
Numbers (${numbers?.length || 0}): ${numbers.length ? `<details>${numbers.join('\n')}</details>` : 'Nothing...'}
Emails (${emails?.length || 0}): ${emails.length ? `<details>${emails.join('\n')}</details>` : 'Nothing...'}
Phones (${phones?.length}): ${phones.length ? `<details>${phones.join('\n')}</details>` : 'Nothing...'}

Size: ${bytes < 1024 ? `${bytes.toFixed(2)} B` : kb < 1024 ? `${kb.toFixed(2)} KB` : `${mb.toFixe(2)} MB`}
`.trim();
})

// Text replacer
const textWorkerReplacerCont = textWorkerServiceWrap.querySelector('div.replacer');
const textWorkerReplacerTextarea = textWorkerReplacerCont.querySelector('textarea');
const textWorkerReplacerFromInput = textWorkerReplacerCont.querySelector('input.from');
const textWorkerReplacerToInput = textWorkerReplacerCont.querySelector('input.to');
const textWorkerReplacerResult = textWorkerReplacerCont.querySelector('div');

const textWorkerReplacerBtn = textWorkerReplacerCont.querySelector('button');
textWorkerReplacerBtn.addEventListener('click', () => {
  const val = textWorkerReplacerTextarea.value;
  const from = textWorkerReplacerFromInput.value;
  const to = textWorkerReplacerToInput.value;

  textWorkerReplacerResult.textContent = val.replaceAll(from, to);
})

// Case converter
const textWorkerCaseConverterCont = textWorkerServiceWrap.querySelector('div.case-converter');
const textWorkerCaseConverterTextarea = textWorkerCaseConverterCont.querySelector('textarea');
const textWorkerCaseConverterSelectType = textWorkerCaseConverterCont.querySelector('select');
const textWorkerCaseConverterResult = textWorkerCaseConverterCont.querySelector('div');

const textWorkerCaseConverterBtn = textWorkerCaseConverterCont.querySelector('button');
textWorkerCaseConverterBtn.addEventListener('click', () => {
  const val = textWorkerCaseConverterTextarea.value;
  const type = textWorkerCaseConverterSelectType.value;

  textWorkerCaseConverterResult.textContent =
  type === 'UPPERCASE' ? val.toUpperCase()
  : type === 'lowercase' ? val.toLowerCase()
  : type === 'Title Case' ? val.split(' ').map(w => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(' ')
  : type === 'iNVERT cASE' ? val.split(' ').map(w => w[0].toLowerCase() + w.slice(1).toUpperCase()).join(' ')
  : type === 'camelCase' ? val.split(' ').map((w, i) => {
    if(i > 0) return w[0].toUpperCase() + w.slice(1).toLowerCase();
    else return w.toLowerCase();
  }).join('')
  : type === 'snake_case' ? val.replace(/ +/g, '_').toLowerCase()
  : type === 'kebab-case' ? val.replace(/ +/g, '-').toLowerCase()
  : val;
})

// Cleanup text
const textWorkerCleanupCont = textWorkerServiceWrap.querySelector('div.cleanup');
const textWorkerCleanupResult = textWorkerCleanupCont.querySelector('div');

const textWorkerCleanupTextarea = textWorkerCleanupCont.querySelector('textarea');
textWorkerCleanupTextarea.addEventListener('input', () => {
  const val = textWorkerCleanupTextarea.value.trim();

  textWorkerCleanupResult.textContent = val
    .replace(/\t+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/([,!;'"`?=+ ])\1+/g, '$1')
    .replace(/\.{4,}/g, '...')
    .replace(/([a-zа-яіїґ])\1{2,}/gi, '$1$1')
    .split('\n').map(l => l.trimEnd()).join('\n');
});

const textWorkerCleanupTextCopyBtn = textWorkerCleanupCont.querySelector('button');
textWorkerCleanupTextCopyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(textWorkerCleanupResult.textContent);
  showResponseFn('Copied');
})

// Remove duplicates
const textWorkerRemoveDuplicatesCont = textWorkerServiceWrap.querySelector('div.remove-duplicates');
const textWorkerRemoveDuplicatesResult = textWorkerRemoveDuplicatesCont.querySelector('div');

const textWorkerRemoveDuplicatesTextarea = textWorkerRemoveDuplicatesCont.querySelector('textarea');
textWorkerRemoveDuplicatesTextarea.addEventListener('input', () => {
  const val = textWorkerRemoveDuplicatesTextarea.value.trim();
  textWorkerRemoveDuplicatesResult.textContent = [...new Set(val
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .split(/\s+/)
    .filter(Boolean))
  ].join('\n');
})

// Sort lines
const textWorkerSortLinesCont = textWorkerServiceWrap.querySelector('div.sort-lines');
const textWorkerSortLinesResult = textWorkerSortLinesCont.querySelector('div');
const textWorkerSortLinesSelectType = textWorkerSortLinesCont.querySelector('select');
const textWorkerSortLinesTextarea = textWorkerSortLinesCont.querySelector('textarea');

const textWorkerSortLinesBtn = textWorkerSortLinesCont.querySelector('button');
textWorkerSortLinesBtn.addEventListener('click', () => {
  const val = textWorkerSortLinesTextarea.value.trim();
  const type = textWorkerSortLinesSelectType.value;

  textWorkerSortLinesResult.textContent = val
    .split(/\n+/)
    .sort((a, b) => type === 'az' ? a.localeCompare(b) : b.localeCompare(a))
    .join('\n');
})

// Number lines
const textWorkerNumberLinesCont = textWorkerServiceWrap.querySelector('div.number-lines');
const textWorkerNumberLinesResult = textWorkerNumberLinesCont.querySelector('div');
const textWorkerNumberLinesSelectAction = textWorkerNumberLinesCont.querySelector('select');
const textWorkerNumberLinesTextarea = textWorkerNumberLinesCont.querySelector('textarea');

const textWorkerNumberLinesBtn = textWorkerNumberLinesCont.querySelector('button');
textWorkerNumberLinesBtn.addEventListener('click', () => {
  const val = textWorkerNumberLinesTextarea.value.trim();
  const action = textWorkerNumberLinesSelectAction.value;
  const lines = val.split(/\n+/);

  textWorkerNumberLinesResult.textContent =
  action === 'add' ? lines.map((l, i) => `${i + 1}. ${l}`).join('\n')
  : action === 'remove' ? lines.map(l => l.replace(/^\d+\. /g, '')).join('\n')
  : val;
})

// Generate uuid
const textWorkerGenerateUuidCont = textWorkerServiceWrap.querySelector('div.generate-uuid');
const textWorkerGenerateUuidResultP = textWorkerGenerateUuidCont.querySelector('p');

const textWorkerGenerateUuidBtn = textWorkerGenerateUuidCont.querySelector('button');
textWorkerGenerateUuidBtn.addEventListener('click', () => {
  const uuid = crypto.randomUUID();
  textWorkerGenerateUuidResultP.innerHTML = `${uuid}<button class='copy-btn' onclick='navigator.clipboard.writeText("${uuid}"); showResponseFn("${uuid} - copied")'><svg><use href='#copy-code'></use></svg></button>`
})

// Generate password
const textWorkerGeneratePasswordCont = textWorkerServiceWrap.querySelector('div.generate-password');
const textWorkerGeneratePasswordCountInput = textWorkerGeneratePasswordCont.querySelector('input');
const textWorkerGeneratePasswordResultP = textWorkerGeneratePasswordCont.querySelector('p');

const textWorkerCheckUppLetters = textWorkerGeneratePasswordCont.querySelector('input#ABC'),
  textWorkerCheckLowLetters = textWorkerGeneratePasswordCont.querySelector('input#abc'),
  textWorkerCheckNumber = textWorkerGeneratePasswordCont.querySelector('input#numbers'),
  textWorkerCheckSymbols = textWorkerGeneratePasswordCont.querySelector('input#symbols');

const textWorkerGeneratePasswordBtn = textWorkerGeneratePasswordCont.querySelector('button');
textWorkerGeneratePasswordBtn.addEventListener('click', () => {
  let lng = Number(textWorkerGeneratePasswordCountInput.value);
  if(lng < 8 || lng > 32) return showResponseFn('Please enter correct password length (8 ≤ length ≤ 32)');

  let charset = '';
  if(textWorkerCheckUppLetters.checked) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if(textWorkerCheckLowLetters.checked) charset += "abcdefghijklmnopqrstuvwxyz";
  if(textWorkerCheckNumber.checked) charset += "0123456789";
  if(textWorkerCheckSymbols.checked) charset += "!@#$%^&*()-_=+[]{}/\\~;:";

  if(!charset) return showResponseFn('Select at least one character set.');

  let pass = '';
  while(lng-- > 0) pass += charset[Math.floor(Math.random() * charset.length)];

  textWorkerGeneratePasswordResultP.innerHTML = `${pass}<button class='copy-btn' onclick='navigator.clipboard.writeText("${pass}"); showResponseFn("${pass} - copied")'><svg><use href='#copy-code'></use></svg></button>`;
})

// Hash generator
async function generateSHA256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
const textWorkerHashGeneratorCont = textWorkerServiceWrap.querySelector('div.hash-generator');
const textWorkerHashGeneratorTextarea = textWorkerHashGeneratorCont.querySelector('textarea');

const textWorkerHashGeneratorResult = textWorkerHashGeneratorCont.querySelector('div');
textWorkerHashGeneratorResult.addEventListener('click', () => {
  navigator.clipboard.writeText(textWorkerHashGeneratorResult.textContent);
  showResponseFn('Copied');
})

const textWorkerHashGeneratorBtn = textWorkerHashGeneratorCont.querySelector('button');
textWorkerHashGeneratorBtn.addEventListener('click', async () => {
  const text = textWorkerHashGeneratorTextarea.value.trim();
  if(!text) return;

  textWorkerHashGeneratorResult.textContent = await generateSHA256(text);
})

// Generate random number
const textWorkerRandomNumberCont = textWorkerServiceWrap.querySelector('div.random-number');
const textWorkerRandomNumberInputMin = textWorkerRandomNumberCont.querySelector('input.from');
const textWorkerRandomNumberInputMax = textWorkerRandomNumberCont.querySelector('input.to');
const textWorkerRandomNumberResultP = textWorkerRandomNumberCont.querySelector('p');

const textWorkerRandomNumberBtn = textWorkerRandomNumberCont.querySelector('button');
textWorkerRandomNumberBtn.addEventListener('click', () => {
  const min = textWorkerRandomNumberInputMin.value.trim();
  const max = textWorkerRandomNumberInputMax.value.trim();

  if(isNaN(min) || isNaN(max)) return showResponseFn('Min or max is not a number');
  if(min > max) return showResponseFn('Your min number is greater than the max');

  const randomNum = Math.floor(Math.random() * (max - min + 1)) + +min;
  textWorkerRandomNumberResultP.innerHTML = `${randomNum}<button class='copy-btn' onclick='navigator.clipboard.writeText("${randomNum}")'><svg><use href='#copy-code'></use></svg></button>`;
})

// view/render HTML
const textWorkerViewHtmlCont = textWorkerServiceWrap.querySelector('div.html-view');
const textWorkerViewHtmlIframe = textWorkerViewHtmlCont.querySelector('iframe');

let textWorkerViewHtmlTimer = null;
const textWorkerViewHtmlTextarea = textWorkerViewHtmlCont.querySelector('textarea');
textWorkerViewHtmlTextarea.addEventListener('input', () => {
  clearTimeout(textWorkerViewHtmlTimer);
  textWorkerViewHtmlTimer = setTimeout(() => {
    const html = textWorkerViewHtmlTextarea.value;

    textWorkerViewHtmlIframe.srcdoc = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      /* reset styles */
      * {
        all: unset;
        display: revert;
        box-sizing: border-box;
      }

      body {
        margin: 0;
        font-family: sans-serif;
      }
    </style>
  </head>
  <body>
  ${html}
  </body>
  </html>
  `.trim();
  }, 500);
});

// URL Parser
const textWorkerUrlParserCont = textWorkerServiceWrap.querySelector('div.url-parser');

const textWorkerUrlParserInput = textWorkerUrlParserCont.querySelector('input');
textWorkerUrlParserInput.addEventListener('input', () => {
  try {
    const url = new URL(textWorkerUrlParserInput.value.trim());

    textWorkerUrlParserResultCont.innerHTML = `
      <p>Protocol: <strong>${url.protocol}</strong></p>
      <p>Host name: <strong>${url.hostname}</strong></p>
      <p>Host: <strong>${url.host}</strong></p>
      <p>Port: <strong>${url.port || 'None...'}</strong></p>
      <p>Path: <strong>${url.pathname}</strong></p>
      <p>Search: <strong>${url.search || 'None...'}</strong></p>
      <p>Hash: <strong>${url.hash || 'None...'}</strong></p>
      <p>Origin: <strong>${url.origin}</strong></p>
    `;
  } catch {
    textWorkerUrlParserResultCont.innerHTML = '<p>Invalid URL</p>';
  }
});

const textWorkerUrlParserResultCont = textWorkerUrlParserCont.querySelector('div');

// HTTP status info
const textWorkerHttpStatuses = {
  // 1xx Informational
  100: {
    name: 'Continue',
    description: `The server has received the request headers and the client should proceed to send the request body.\n\nExample: Used in large file uploads to check if the server accepts the request before sending the whole payload.`
  },
  101: { name: "Switching Protocols", description: "The server understands and is willing to comply with the client's request to switch protocols." },
  102: { name: 'Processing', description: 'The server has received and is processing the request, but no response is available yet.' },
  103: { name: 'Early Hints', description: 'Used to return some response headers before final HTTP message.' },

  // 2xx Success
  200: { name: 'OK', description: 'The request has succeeded. The information sent in the request can be considered valid.' },
  201: { name: 'Created', description: 'The request has been fulfilled and has resulted in one or more new resources being created.' },
  202: { name: 'Accepted', description: 'The request has been accepted for processing, but the processing has not been completed.' },
  203: { name: 'Non-Authoritative Information', description: 'The returned meta-information is not exactly as is available from the origin server.' },
  204: { name: 'No Content', description: 'The server successfully processed the request and is not returning any content.' },
  205: { name: 'Reset Content', description: 'The server successfully processed the request, but is asking the client to reset the document view.' },
  206: { name: 'Partial Content', description: 'The server is delivering only part of the resource due to a range header sent by the client.' },

  // 3xx Redirection
  300: { name: 'Multiple Choices', description: 'Indicates multiple options for the resource that the client may choose from.' },
  301: { name: 'Moved Permanently', description: 'The requested resource has been assigned a new permanent URI.' },
  302: { name: 'Found', description: 'The resource resides temporarily under a different URI.' },
  304: { name: 'Not Modified', description: 'Indicates that the resource has not been modified since the last request.' },
  307: { name: 'Temporary Redirect', description: 'The request should be repeated with another URI, but future requests should still use the original URI.' },
  308: { name: 'Permanent Redirect', description: 'The request should be repeated with another URI, and future requests should always use the new URI.' },

  // 4xx Client Error
  400: {
    name: 'Bad Request',
    description: `The server cannot process the request due to a client error (e.g., malformed syntax).\n\nExample: Sending a string where a number is expected in a JSON body.`
  },
  401: { name: 'Unauthorized', description: 'Authentication is required and has failed or has not yet been provided.' },
  402: { name: 'Payment Required', description: 'Reserved for future use. Often used in digital payment scenarios.' },
  403: { name: 'Forbidden', description: 'The server understood the request but refuses to authorize it.' },
  404: { name: 'Not Found', description: 'The server cannot find the requested resource.' },
  405: { name: 'Method Not Allowed', description: 'The request method is known by the server but is not supported by the target resource.' },
  406: { name: 'Not Acceptable', description: 'The requested resource is capable of generating only content not acceptable according to the Accept headers.' },
  408: { name: 'Request Timeout', description: 'The server timed out waiting for the request.' },
  409: { name: 'Conflict', description: 'The request could not be completed due to a conflict with the current state of the resource.' },
  410: { name: 'Gone', description: 'The requested resource is no longer available and will not be available again.' },
  413: { name: 'Payload Too Large', description: 'The request entity is larger than limits defined by server.' },
  415: { name: 'Unsupported Media Type', description: 'The request entity has a media type which the server or resource does not support.' },
  422: { name: 'Unprocessable Entity', description: 'The request was well-formed but was unable to be followed due to semantic errors.' },
  429: {
    name: 'Too Many Requests',
    description: `The user has sent too many requests in a given amount of time.\n\nExample: Hitting an API endpoint too fast and triggering rate limiting.`
  },

  // 5xx Server Error
  500: {
    name: 'Internal Server Error',
    description: `A generic error message, given when an unexpected condition was encountered.\n\nExample: A crash in the backend code or a database connection failure.`
  },
  501: { name: 'Not Implemented', description: 'The server does not support the functionality required to fulfill the request.' },
  502: { name: 'Bad Gateway', description: 'The server, acting as a gateway, received an invalid response from the upstream server.' },
  503: {
    name: 'Service Unavailable',
    description: `The server is currently unable to handle the request.\n\nExample: The server is down for maintenance or is overloaded.`
  },
  504: { name: 'Gateway Timeout', description: 'The server, acting as a gateway, did not receive a timely response from the upstream server.' },

  207: { 
    name: 'Multi-Status', 
    description: 'The response body is an XML message that contains multiple status codes.' 
  },
  208: { 
    name: 'Already Reported', 
    description: 'Used inside a DAV response to avoid repeatedly enumerating the same status.' 
  },
  226: { 
    name: 'IM Used', 
    description: 'The server has fulfilled a GET request for the resource, and the response is a representation of the result of one or more instance-manipulations applied to the current instance.' 
  },

  // 3xx Redirection (Missing)
  303: { 
    name: 'See Other', 
    description: 'The response to the request can be found under another URI using a GET method.' 
  },
  305: { 
    name: 'Use Proxy', 
    description: 'The requested resource must be accessed through the proxy given by the Location field.' 
  },

  // 4xx Client Error (Missing)
  407: { 
    name: 'Proxy Authentication Required', 
    description: 'The client must first authenticate itself with the proxy.' 
  },
  411: { 
    name: 'Length Required', 
    description: 'The request did not specify the length of its content, which is required by the requested resource.' 
  },
  412: { 
    name: 'Precondition Failed', 
    description: 'One or more conditions given in the request header fields evaluated to false when tested on the server.' 
  },
  414: { 
    name: 'URI Too Long', 
    description: 'The URI requested by the client is longer than the server is willing to interpret.' 
  },
  416: { 
    name: 'Range Not Satisfiable', 
    description: 'The range specified by the Range header field in the request cannot be fulfilled.' 
  },
  417: { 
    name: 'Expectation Failed', 
    description: 'The server cannot meet the requirements of the Expect request-header field.' 
  },
  418: { 
    name: "I'm a teapot", 
    description: 'The server refuses the attempt to brew coffee because it is, permanently, a teapot.' 
  },
  421: { 
    name: 'Misdirected Request', 
    description: 'The request was directed at a server that is not able to produce a response.' 
  },
  423: { 
    name: 'Locked', 
    description: 'The resource that is being accessed is locked.' 
  },
  424: { 
    name: 'Failed Dependency', 
    description: 'The request failed due to failure of a previous request.' 
  },
  425: { 
    name: 'Too Early', 
    description: 'Indicates that the server is unwilling to risk processing a request that might be replayed.' 
  },
  426: { 
    name: 'Upgrade Required', 
    description: 'The server refuses to perform the request using the current protocol but might be willing to do so after the client upgrades to a different protocol.' 
  },
  428: { 
    name: 'Precondition Required', 
    description: 'The origin server requires the request to be conditional.' 
  },
  431: { 
    name: 'Request Header Fields Too Large', 
    description: 'The server is unwilling to process the request because its header fields are too large.' 
  },
  451: { 
    name: 'Unavailable For Legal Reasons', 
    description: 'The user agent requested a resource that cannot legally be provided, such as a web page censored by a government.' 
  },

  // 5xx Server Error (Missing)
  505: { 
    name: 'HTTP Version Not Supported', 
    description: 'The server does not support the HTTP protocol version used in the request.' 
  },
  506: { 
    name: 'Variant Also Negotiates', 
    description: 'Transparent content negotiation for the request results in a circular reference.' 
  },
  507: { 
    name: 'Insufficient Storage', 
    description: 'The server is unable to store the representation needed to complete the request.' 
  },
  508: { 
    name: 'Loop Detected', 
    description: 'The server detected an infinite loop while processing the request.' 
  },
  510: { 
    name: 'Not Extended', 
    description: 'Further extensions to the request are required for the server to fulfill it.' 
  },
  511: { 
    name: 'Network Authentication Required', 
    description: 'The client needs to authenticate to gain network access.' 
  }
};

const textWorkerHttpStatusInfoCont = textWorkerServiceWrap.querySelector('div.http-status-info');
const textWorkerHttpStatusInfoResultCont = textWorkerHttpStatusInfoCont.querySelector('div');

const textWorkerHttpStatusInfoSelect = textWorkerHttpStatusInfoCont.querySelector('select');
textWorkerHttpStatusInfoSelect.innerHTML = `<option value='' disabled selected>--||--</option>${Object.keys(textWorkerHttpStatuses).map(status => `<option value="${status}">${status} - ${textWorkerHttpStatuses[status].name}</option>`)}`;
textWorkerHttpStatusInfoSelect.addEventListener('change', () => {
  const status = textWorkerHttpStatusInfoSelect.value;
  const info = textWorkerHttpStatuses[status];
  if(!info) return textWorkerHttpStatusInfoResultCont.innerHTML = '<h3>No status info...</h3>';

  textWorkerHttpStatusInfoResultCont.innerHTML = `
<h3>${status}</h3>
<strong>${info.name}</strong>
<p>${info.description}</p>
`.trim();
})