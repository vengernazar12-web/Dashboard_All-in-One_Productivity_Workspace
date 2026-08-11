const substringsSearchWrap = document.querySelector('.substrings-search-wrap');
// Open
const openSubstringsSearchBtn = allDashboardItem.querySelector('.open-substrings-search-wrap');
openSubstringsSearchBtn.addEventListener('click', () => {
  closeAllWraps();
  substringsSearchWrap.classList.add('show');

  showResponseFn('WARNING: This service processes all substrings, so it might be slow with large texts!');

  history.pushState(null, {}, '#substrings-search');
})

// Textarea
const substringProcessTextarea = substringsSearchWrap.querySelector('textarea');

let substringsSearchWorker = new Worker('./substrings-search-worker-code.js');

// Start
const substringsSearchStartBtn = substringsSearchWrap.querySelector('button.start');
substringsSearchStartBtn.addEventListener('click', async () => {
  const text = substringProcessTextarea.value.trim();

  if (!text) {
    substringsSearchStopBtn.disabled = true;
    substringsSearchStartBtn.disabled = false;
    substringProcessTextarea.readOnly = false;
    return;
  };

  const textLng = text.length;

  substringsSearchStopBtn.disabled = false;
  substringsSearchStartBtn.disabled = true;
  substringProcessTextarea.readOnly = true;

  substringsSearchResultContainer.textContent = '';

  substringsSearchProgress.value = 0;
  substringsSearchProgress.max = textLng;
  substringsSearchResultContainer.dataset.info = `0/${textLng}`;

  substringsSearchWorker.postMessage({ text, textLng })

  substringsSearchWorker.onmessage = ({ data }) => {
    const type = data.type;

    if(type === 'progress') {
      const max = data.max;
      const value = data.value;
      const dataInfo = data.dataInfo;

      if(max !== undefined) substringsSearchProgress.max = max;
      substringsSearchProgress.value = value;
      substringsSearchResultContainer.dataset.info = dataInfo;
    }
    else if(type === 'result') {
      const result = data.result;
      substringsSearchResultContainer.textContent = result;

      substringsSearchStopBtn.disabled = true;
      substringsSearchStartBtn.disabled = false;
      substringProcessTextarea.readOnly = false;
    }
  };
})

// Stop
const substringsSearchStopBtn = substringsSearchWrap.querySelector('button.stop');
substringsSearchStopBtn.addEventListener('click', () => {
  substringsSearchWorker.terminate();
  substringsSearchWorker = new Worker('./substrings-search-worker-code.js');

  substringsSearchStopBtn.disabled = true;
  substringsSearchStartBtn.disabled = false;
  substringProcessTextarea.readOnly = false;
});

// Progress
const substringsSearchProgress = substringsSearchWrap.querySelector('progress');

// Result container
const substringsSearchResultContainer = substringsSearchWrap.querySelector('div.result-container');