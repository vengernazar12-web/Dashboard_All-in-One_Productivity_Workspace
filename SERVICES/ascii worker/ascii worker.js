const asciiWorkerWrap = document.querySelector('.ascii-worker-wrap');

// Open
let asciiWorkerTextToAsciiStyles = null;
const openAsciiWorkerBtn = allDashboardItem.querySelector('button.open-ascii-worker-wrap');
openAsciiWorkerBtn.addEventListener('click', async () => {
  closeAllWraps();
  asciiWorkerWrap.classList.add('show');

  history.pushState({}, null, '#asciiWorker');

  if(!asciiWorkerTextToAsciiStyles) {
    asciiWorkerTextToAsciiStyles = await fetch('https://ascii-worker.dark-backend.workers.dev/fonts').then(r => r.json());
    asciiWorkerTextToAsciiSelectStyle.innerHTML = `<option value='' selected>Default</option>${asciiWorkerTextToAsciiStyles.fonts.map(style => `<option value='${style}'>${style}</option>`)}`;
  }
})

function asciiWorkerCloseAllWindows() {
  for(const window of asciiWorkerWrap.querySelectorAll('div.window')) window.classList.remove('open');
}

// Text to ASCII art
const asciiWorkerTextToAsciiWindow = asciiWorkerWrap.querySelector('div.text-to-art-window');
const asciiWorkerTextToAsciiTextarea = asciiWorkerTextToAsciiWindow.querySelector('textarea');
const asciiWorkerTextToAsciiResultCont = asciiWorkerTextToAsciiWindow.querySelector('div.result');
const asciiWorkerTextToAsciiSelectStyle = asciiWorkerTextToAsciiWindow.querySelector('select');

const asciiWorkerTextToAsciiReplaceSpacesInput = asciiWorkerTextToAsciiWindow.querySelector('input#replace-space');
asciiWorkerTextToAsciiReplaceSpacesInput.addEventListener('input', () => {
  const value = asciiWorkerTextToAsciiReplaceSpacesInput.value || ' ';
  asciiWorkerTextToAsciiResultCont.textContent = lastAsciiTextArt ? lastAsciiTextArt.replaceAll(' ', value) : '';
});

const asciiWorkerTextToAsciiCopyBtn = asciiWorkerTextToAsciiWindow.querySelector('button.copy');
asciiWorkerTextToAsciiCopyBtn.addEventListener('click', async () => {
  await navigator.clipboard.writeText(asciiWorkerTextToAsciiResultCont.textContent);
  showResponseFn('Copied');
})

let lastAsciiTextArt = null;
const asciiWorkerTextToAsciiSendBtn = asciiWorkerTextToAsciiWindow.querySelector('button.send');
asciiWorkerTextToAsciiSendBtn.addEventListener('click', async () => {
  const text = asciiWorkerTextToAsciiTextarea.value.trim();

  if(!text) return;
  if(text.length > 1500) return showResponseFn('Your text is too long (> 1500)');
  if(!/^[\x00-\x7F—]*$/.test(text)) return showResponseFn('Unsupported characters');

  asciiWorkerTextToAsciiResultCont.textContent = 'Loading...';
  asciiWorkerTextToAsciiSendBtn.disabled = true;

  const replaceSpaceSymbol = asciiWorkerTextToAsciiReplaceSpacesInput.value;

  try {
    lastAsciiTextArt = await fetch(`https://ascii-worker.dark-backend.workers.dev?text=${encodeURIComponent(text)}&font=${asciiWorkerTextToAsciiSelectStyle.value || ''}`)
      .then(r => r.text());
    asciiWorkerTextToAsciiResultCont.textContent = replaceSpaceSymbol ? lastAsciiTextArt.replaceAll(' ', replaceSpaceSymbol) : lastAsciiTextArt;
  } catch(e) {
    showResponseFn(e.message);
  } finally { asciiWorkerTextToAsciiSendBtn.disabled = false; }
})

// Image to ASCII art
const asciiWorkerImageToAsciiWindow = asciiWorkerWrap.querySelector('div.image-to-art-window');
const asciiWorkerImageToAsciiInputFiles = asciiWorkerImageToAsciiWindow.querySelector('input[type="file"]');
const asciiWorkerImageToAsciiResultCont = asciiWorkerImageToAsciiWindow.querySelector('div.result');

const asciiWorkerImageToAsciiCopyBtn = asciiWorkerImageToAsciiWindow.querySelector('button.copy');
asciiWorkerImageToAsciiCopyBtn.addEventListener('click', async () => {
  await navigator.clipboard.writeText(asciiWorkerImageToAsciiResultCont.textContent);
  showResponseFn('Copied');
})

const asciiWorkerImageToAsciiSendBtn = asciiWorkerImageToAsciiWindow.querySelector('button.send');
asciiWorkerImageToAsciiSendBtn.addEventListener('click', async () => {
  const image = asciiWorkerImageToAsciiInputFiles.files[0];
  if(!image) return;

  asciiWorkerImageToAsciiResultCont.innerHTML = '<p style="font-size: 14px;">Loading...</p>';
  asciiWorkerImageToAsciiSendBtn.disabled = true;

  try {
    const formData = new FormData();
    formData.append('image', image);

    asciiWorkerImageToAsciiResultCont.innerHTML = await fetch('https://ascii-worker.dark-backend.workers.dev/imageToAscii', {
      method: 'POST',
      body: formData
    }).then(r => r.text()).then(html => html
      .replace(/<style>[\s\S]+?<\/style>|<title>.+?<\/title>|<meta charset="utf-8">|<\/?body>|<\/?head>|<!DOCTYPE html>|<\/?html>/g, '')
      .replace(/^(?:\r?\n)*(?:<span\b[^>]*>(?:&nbsp;)+<\/span>\r?\n)+/, '')
    )
  } catch (e) { showResponseFn(e.message); }
  finally { asciiWorkerImageToAsciiSendBtn.disabled = false; }
})

// DELEGATION FOR OPEN/CLOSE WINDOWS
asciiWorkerWrap.addEventListener('click', async e => {
  const target = e.target;

  const isBtn = target.tagName === 'BUTTON';

  const isOpenWindowBtn = isBtn && target.classList.contains('open-window');
  const isCloseWindow = isBtn && target.classList.contains('close');

  if (isOpenWindowBtn) {
    const window = target.dataset.window;

    if (window) {
      asciiWorkerCloseAllWindows();
      asciiWorkerWindowsMap[window].classList.add('open');
    }
  }
  else if (isCloseWindow) asciiWorkerCloseAllWindows();
});

const asciiWorkerWindowsMap = {
  textToAscii: asciiWorkerTextToAsciiWindow,
  imageToAscii: asciiWorkerImageToAsciiWindow,
}