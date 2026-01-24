const calculatorWrap = document.querySelector('.calc-wrap');
document.querySelector('.open-calc-wrap')
.addEventListener('click', () => {
  showPreloader();
  calculatorWrap.classList.add('show');
  allCalcBtnsObj['='].click();
  showPreloader(false);
});
document.querySelector('.close-calc-wrap')
.addEventListener('click', () => calculatorWrap.classList.remove('show'));

const allCalcBtnsObj = {};
const calcContainer = document.querySelector('.calc-container');
const allNavBtns = document.querySelectorAll('.navigation-panel button');
for(let v of allNavBtns) allCalcBtnsObj[v.dataset.value] = v;

const headerPanel = document.querySelector('.header-panel');
const calculatorText = headerPanel.querySelector('p');

const delCalcSymbolBtn = document.querySelector('.delete-symbol-btn');
delCalcSymbolBtn.addEventListener('click', () => { calculatorText.textContent = calculatorText.textContent.slice(0, -1); })

const operators = ['+', '-', '/', '*']

isAnswer = false;

calculatorWrap.addEventListener('click', e => {
  const b = e.target;
  const l = calculatorText.textContent[calculatorText.textContent.length - 1];
  if(b.tagName === 'BUTTON' && isAnswer && (/[-\+\/\*\d]/.test(b.dataset.value) || b === delCalcSymbolBtn)) {
    calculatorText.textContent = '';
    isAnswer = false;
  };

  if(b.dataset?.value === '=') {
    if(operators.includes(l) || l === '.') return;
    try {
      const exp = calculatorText
        .textContent
        .replaceAll('×', '*')
        .replaceAll('÷', '/')
      calculatorText.textContent = Function(`return ${exp}`)()
      isAnswer = true;
    }
    catch { calculatorText.textContent = 'Error!'; isAnswer = true; }
  }

  else if(/\d/.test(b.dataset?.value)) { calculatorText.textContent += b.dataset?.value; }

  else if(operators.includes(b.dataset?.value)) {
    if(b.dataset.value === '-') {if(/\d/.test(l) || !l) {calculatorText.textContent += '-'; }}
    else if(/\d/.test(l)) calculatorText.textContent += b.textContent;
  }

  else if(b.dataset?.value === '.') { if(/\d/.test(l)) calculatorText.textContent += '.'; }

  headerPanel.scrollLeft = headerPanel.scrollWidth;
})