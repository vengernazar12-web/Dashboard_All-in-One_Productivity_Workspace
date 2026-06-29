const colorWorkerWrap = document.querySelector('.color-worker-wrap');
// Open
const openColorWorkerBtn = allDashboardItem.querySelector('.open-color-worker-wrap');
openColorWorkerBtn.addEventListener('click', () => {
  closeAllWraps();
  history.pushState({}, null, '#color-worker');
  colorWorkerWrap.classList.add('show');
})

function hexToRgb(hex) {
  const num = parseInt(hex.slice(1), 16);

  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function hexToHsl(hex) {
  let { r, g, b } = hexToRgb(hex);

  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  let h;
  let s;
  const l = (max + min) / 2;

  if(max === min) {
    h = s = 0;
  } else {
    const d = max - min;

    s = l > 0.5
      ? d / (2 - max - min)
      : d / (max + min);

    switch(max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }

    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

function colorWorkerCreateCopyBtn(color) { return `<button class='copy-color' onclick='navigator.clipboard.writeText("${color}"); showResponseFn("${color} - copied")'><svg><use href='#copy-code'></use></svg></button>` }
function initColorWorkerResult() {
  const alfa = colorWorkerAlfaRangeInput.value;

  const hex = colorWorkerColorInput.value;
  const hexAlfa = Math.round(alfa * 255).toString(16).padStart(2, '0');

  const { r, g, b } = hexToRgb(hex);
  const rgb = `rgba(${r}, ${g}, ${b}, ${alfa})`;

  const { h, s, l } = hexToHsl(hex);
  const hsl = `hsla(${h}, ${s}%, ${l}%, ${alfa})`;

  colorWorkerResultCont.innerHTML = `
<p>${hex}${hexAlfa} ${colorWorkerCreateCopyBtn(hex + hexAlfa)}</p>
<p>${rgb} ${colorWorkerCreateCopyBtn(rgb)}</p>
<p>${hsl} ${colorWorkerCreateCopyBtn(hsl)}</p>
`.trim();

  colorWorkerResultCont.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${alfa})`;
}

const colorWorkerResultCont = colorWorkerWrap.querySelector('div');

const colorWorkerColorInput = colorWorkerWrap.querySelector('input[type="color"]');
colorWorkerColorInput.addEventListener('input', () => initColorWorkerResult());

const colorWorkerAlfaRangeInput = colorWorkerWrap.querySelector('input[type="range"]');
colorWorkerAlfaRangeInput.addEventListener('input', () => initColorWorkerResult());