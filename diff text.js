const diffTextWrap = document.querySelector('.diff-text-wrap');
// Open
let isDiffTextScriptLoaded = false;
const openDiffTextBtn = allDashboardItem.querySelector('.open-diff-text-wrap');
openDiffTextBtn.addEventListener('click', async () => {
  closeAllWraps();
  history.pushState({}, null, '#diff-text');

  if(!isDiffTextScriptLoaded) {
    showPreloader();
    whatIsLoadingText.textContent = 'Loading service...';
    preloaderProgress.max = 1;
    preloaderProgress.value = 0;

    await loadScript('https://cdn.jsdelivr.net/npm/diff@5/dist/diff.min.js');

    preloaderProgress.value = 1;
    setTimeout(() => showPreloader(false), 500);
  }

  diffTextWrap.classList.add('show');
});

const diffTextCont1 = diffTextWrap.querySelector('div.text1');
const diffTextCont2 = diffTextWrap.querySelector('div.text2');
const diffTextResultCont = diffTextWrap.querySelector('div.result');

const diffTextCompareBtn = diffTextWrap.querySelector('button');
diffTextCompareBtn.addEventListener('click', () => {
  const text1 = diffTextCont1.innerText.replaceAll('\r', '');
  const text2 = diffTextCont2.innerText.replaceAll('\r', '');

  if(!text1.trim()) return showResponseFn('Please input first text');
  if(!text2.trim()) return showResponseFn('Please input second text');

  const diff = Diff.diffLines(text1, text2);

  const frag = document.createDocumentFragment();
  diffTextResultCont.textContent = '';

  for(const part of diff) {
    const div = document.createElement('div');
    div.textContent = part.value;

    if(part.added) div.style.border = '1px solid #00ff00';
    else if(part.removed) div.style.border = '1px solid #f00';

    frag.appendChild(div);
  }

  diffTextResultCont.appendChild(frag);
})