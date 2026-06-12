const regexpCheckerWrap = document.querySelector('.regexp-checker-wrap');
// Open
const openRegexpCheckerBtn = allDashboardItem.querySelector('.open-regexp-checker-wrap');
openRegexpCheckerBtn.addEventListener('click', () => {
  closeAllWraps();
  if(needPushState) history.pushState({}, null, '#regexp-checker');
  regexpCheckerWrap.classList.add('show');
})

const blockForRegexpCheckText = regexpCheckerWrap.querySelector('div');
blockForRegexpCheckText.addEventListener('blur', () => renderRegexpTextMarks());

let regexpCheckTextTime = null;
const userRegexpForCheckText = regexpCheckerWrap.querySelector('.regexp');
userRegexpForCheckText.addEventListener('input', () => {
  clearTimeout(regexpCheckTextTime);
  regexpCheckTextTime = setTimeout(() => renderRegexpTextMarks(), 500);
})

const userRegexpFlagsForCheckText = regexpCheckerWrap.querySelector('.flags');
userRegexpFlagsForCheckText.addEventListener('input', () => {
  clearTimeout(regexpCheckTextTime);
  regexpCheckTextTime = setTimeout(() => renderRegexpTextMarks(), 500);
})

function renderRegexpTextMarks() {
  let value = userRegexpForCheckText.value;
  const text = blockForRegexpCheckText.innerText;

  if (!value) return blockForRegexpCheckText.innerHTML = hashHtmlSymbols(text);

  const flagsValue = userRegexpFlagsForCheckText.value.trim().replaceAll(' ', '');
  const flags = flagsValue.includes('g') ? flagsValue : `${flagsValue}g`;

  if (value.startsWith('/') || value.startsWith('\\')) value = value.slice(1);
  if (value.endsWith('/') || value.endsWith('\\')) value = value.slice(0, -1);

  let result = '';

  try {
    const regexp = new RegExp(value, flags);
    let match = null;
    let lastIndex = 0;

    while(((match = regexp.exec(text)) !== null)) {
      const before = text.slice(lastIndex, match.index);

      let matched = match[0];

      result += hashHtmlSymbols(before);
      result += '<mark>' + hashHtmlSymbols(matched) + '</mark>';
      let oldLastIndex = lastIndex;
      lastIndex = match.index + matched.length;
      if(oldLastIndex === lastIndex || !matched.length) break;

      if(!flagsValue.includes('g')) break;
    }

    blockForRegexpCheckText.innerHTML = result + hashHtmlSymbols(text.slice(lastIndex));
    showResponseFn(`Found: ${blockForRegexpCheckText.querySelectorAll('mark')?.length || 0}`);
  } catch(e) { showResponseFn(e.message); };
}