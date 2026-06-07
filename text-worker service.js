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
  textWorkerServiceWrap.classList.add('show');
})

// AI text worker
const TEXT_WORKER_API = 'https://text-worker.vengernazar0.workers.dev';

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
  textWorkerAiResult.style.height = '30px';

  const resp = await fetch(TEXT_WORKER_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', "Authorization": userId },
    body: JSON.stringify({ text })
  });

  textWorkerAiResult.innerHTML = await resp.text();
  textWorkerAiResult.style.height = `${textWorkerAiResult.scrollHeight + 3}px`;

  textWorkerAiSendBtn.disabled = false;
  textWorkerServiceLoader.style.display = 'none';
})

// Text cloner
const textWorkerClonerCont = textWorkerServiceWrap.querySelector('div.cloner');
const textWorkerClonerTextarea = textWorkerClonerCont.querySelector('textarea');
const textWorkerClonerCountInput = textWorkerClonerCont.querySelector('input');
const textWorkerClonerResult = textWorkerClonerCont.querySelector('div');

const textWorkerClonerBtn = textWorkerClonerCont.querySelector('button');
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

// Text info
const textWorkerInfoCont = textWorkerServiceWrap.querySelector('div.info');
const textWorkerInfoResult = textWorkerInfoCont.querySelector('div');

const textWorkerInfoTextarea = textWorkerInfoCont.querySelector('textarea');
textWorkerInfoTextarea.addEventListener('input', () => {
  const val = textWorkerInfoTextarea.value;

  const characters = val.length;
  const spaces = val.match(/[ \t]/g)?.length ?? 0;

  const allWords = val.toLowerCase().split(/\s+/);
  const uniqueWords = [...new Set(allWords)];

  textWorkerInfoResult.textContent = `
Characters: ${characters}
Spaces: ${spaces}
Characters without spaces: ${characters - spaces}
Letters: ${val.match(/\p{L}/gu)?.length ?? 0}
Digits: ${val.match(/\d/g)?.length ?? 0}
Words: ${val ? val
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .length : 0}
Lines: ${val ? val.split('\n').length : 0}
Numbers: ${val.match(/\d+/g)?.length ?? 0}
Newlines: ${val.match(/\n/g)?.length ?? 0}
Symbols: ${val.match(/[^\p{L}\p{N}\s]/gu)?.length ?? 0}
Unique words (${uniqueWords.length}): ${val.trim() ? uniqueWords
  .map(w => `${w} - ${allWords.filter(fw => fw === w).length}`)
  .join("\n" + " ".repeat(20 + String(uniqueWords.length).length))
  : 'Nothing...'
}
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
  textWorkerCleanupResult.textContent = val.replace(/[\t ]+|,+|\.{4,}|\n+/g, all => all[0]);
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