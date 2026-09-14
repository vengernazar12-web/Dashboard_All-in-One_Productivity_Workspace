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

// One-line arts search
const asciiWorkerOneLineArtsSearchWindow = asciiWorkerWrap.querySelector('div.one-line-arts-search-window');
const asciiWorkerOneLineArtsSearchInput = asciiWorkerOneLineArtsSearchWindow.querySelector('input');
const asciiWorkerOneLineArtsSearchResultCont = asciiWorkerOneLineArtsSearchWindow.querySelector('div.result');

const asciiWorkerOneLineArtsSearchSendBtn = asciiWorkerOneLineArtsSearchWindow.querySelector('button.send');
asciiWorkerOneLineArtsSearchSendBtn.addEventListener('click', async () => {
  const value = asciiWorkerOneLineArtsSearchInput.value.trim();
  if(!value) return asciiWorkerOneLineArtsSearchResultCont.textContent = '';

  asciiWorkerOneLineArtsSearchResultCont.textContent = 'Loading...';
  asciiWorkerOneLineArtsSearchSendBtn.disabled = true;

  try {
    asciiWorkerOneLineArtsSearchResultCont.innerHTML = await fetch(`https://kaomojis.jp/api/v1/kaomojis/search?q=${value}&limit=25&locale=en`)
      .then(r => r.json())
      .then(d => d.data.map(artInfo => `
<div class='result-card'>
  <h4>${hashHtmlSymbols(artInfo.text)}<button onClick='navigator.clipboard.writeText("${hashHtmlSymbols(artInfo.text)}"); showResponseFn("Copied")'>Copy</button></h4>
  <p>${hashHtmlSymbols(artInfo.note)}</p>

  <details>
    <summary>Usage</summary>
    ${artInfo.usage.map(use => `<p>${hashHtmlSymbols(use)}</p>`).join('')}
  </details>

  <small>${hashHtmlSymbols(artInfo.categories.join(' | '))}</small>
</div>
`).join(''));
  } catch (e) { showResponseFn(e.message); }
  finally { asciiWorkerOneLineArtsSearchSendBtn.disabled = false; }
})

// One-line arts library
const asciiWorkerOneLIneArtsLibraryAutoLoadCategoryList = new IntersectionObserver(async elements => {
  const el = elements[0];
  if(el.isIntersecting && asciiWorkerOneLineArtLibraryPageInfo.init < asciiWorkerOneLineArtLibraryPageInfo.max) {
    const loader = document.createElement('span');
    loader.classList.add('loader');
    el.target.replaceWith(loader);

    const categoryId = asciiWorkerOneLineArtLibraryPageInfo.catId;
    asciiWorkerOneLineArtLibraryPageInfo.init++;

    await fetch(`https://kaomojis.jp/api/v1/kaomojis?category=${categoryId}&page=${asciiWorkerOneLineArtLibraryPageInfo.init}&limit=25&locale=en`)
      .then(r => r.json())
      .then(d => {
        const data = d.data;
        loader.remove();

        const resultCont = asciiWorkerOneLineArtLibraryWindow.lastElementChild;

        const frag = document.createDocumentFragment();
        for(const art of data) {
          const resultCard = document.createElement('div'),
            h4 = document.createElement('h4'),
            small = document.createElement('small');

          resultCard.append(h4, small);
          resultCard.classList.add('result-card');

          h4.innerHTML = `${hashHtmlSymbols(art.text)}<button onClick='navigator.clipboard.writeText("${hashHtmlSymbols(art.text)}"); showResponseFn("Copied")'>Copy</button>`;

          small.textContent = art.categories.join(' | ');

          frag.appendChild(resultCard);
        }

        if( asciiWorkerOneLineArtLibraryPageInfo.init < asciiWorkerOneLineArtLibraryPageInfo.max ) {
          const forLoad = document.createElement('span');
          forLoad.classList.add('for-load');
          frag.appendChild(forLoad);

          asciiWorkerOneLIneArtsLibraryAutoLoadCategoryList.observe(forLoad);
        }

        resultCont.appendChild(frag);
      });
  }
})

let asciiWorkerOneLineArtLibraryCategories = null;
const asciiWorkerOneLineArtLibraryPageInfo = {
  init: 1,
  max: 1
};
const asciiWorkerOneLineArtLibraryWindow = asciiWorkerWrap.querySelector('div.one-line-arts-library-window');
asciiWorkerOneLineArtLibraryWindow.addEventListener('click', async e => {
  const target = e.target;
  const targetCategoryId = target.tagName !== 'A' && target.closest('div.category')?.dataset.id;

  const resultCont = asciiWorkerOneLineArtLibraryWindow.lastElementChild;
  if(resultCont && resultCont.classList.contains('result') && resultCont.classList.contains('open') && !target.closest('.result')) {
    resultCont.textContent = '';
    resultCont.classList.remove('open');
    asciiWorkerOneLineArtLibraryPageInfo.init = 1;
    asciiWorkerOneLineArtLibraryPageInfo.max = 1;
    asciiWorkerOneLineArtLibraryPageInfo.catId = targetCategoryId;
  }

  else if(targetCategoryId) {
    const loader = document.createElement('span');
    loader.classList.add('loader');
    asciiWorkerOneLineArtLibraryWindow.appendChild(loader);

    await fetch(`https://kaomojis.jp/api/v1/kaomojis?category=${targetCategoryId}&page=1&limit=25&locale=en`)
      .then(r => r.json())
      .then(d => {
        const data = d.data;
        asciiWorkerOneLineArtLibraryPageInfo.max = d.pagination.total_pages;
        asciiWorkerOneLineArtLibraryPageInfo.init = 1;
        asciiWorkerOneLineArtLibraryPageInfo.catId = targetCategoryId;

        const resultCont = asciiWorkerOneLineArtLibraryWindow.querySelector('div.result');
        resultCont.innerHTML = `${data.map(art => `
<div class='result-card'>
  <h4>${hashHtmlSymbols(art.text)}<button onClick='navigator.clipboard.writeText("${hashHtmlSymbols(art.text)}"); showResponseFn("Copied")'>Copy</button></h4>
  <small>${hashHtmlSymbols(art.categories.join(' | '))}</small>
</div>
`).join('')}
${asciiWorkerOneLineArtLibraryPageInfo.max > 1 ? '<span class="for-load"></span>' : ''}
`;

        const forLoad = resultCont.lastElementChild;
        if(forLoad.classList.contains('for-load')) asciiWorkerOneLIneArtsLibraryAutoLoadCategoryList.observe(forLoad);

        resultCont.classList.add('open');
        loader.remove();
      });
  }
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

      // If open One-Line art library
      if(target.classList.contains('open-library') && !asciiWorkerOneLineArtLibraryCategories) {
        showPreloader();
        whatIsLoadingText.textContent = 'Loading...';
        preloaderProgress.max = 1;
        preloaderProgress.value = 0;

        asciiWorkerOneLineArtLibraryCategories = await fetch('https://kaomojis.jp/api/v1/categories?type=emotion&locale=en')
          .then(r => r.json())
          .then(d => d.data);

        asciiWorkerOneLineArtLibraryWindow.innerHTML += `
${asciiWorkerOneLineArtLibraryCategories.map(category => `
<div class='category' data-id='${category.id}'>
  <h4>${category.name} ${category.emoji || ''}</h4>
  ${category.description ? `<p>${hashHtmlSymbols(category.description)}</p>` : ''}
  <small>${category.type}</small>

  <a href='${category.url.replace('/category', '/en/category')}' target='_blank'>${category.name} | page</a>
</div>
`).join('')
        }
<div class='result window'></div>
`;

        preloaderProgress.value = 1;
        setTimeout(() => showPreloader(false), 500);
      }
    }
  }
  else if (isCloseWindow) asciiWorkerCloseAllWindows();
});

const asciiWorkerWindowsMap = {
  textToAscii: asciiWorkerTextToAsciiWindow,
  imageToAscii: asciiWorkerImageToAsciiWindow,
  oneLineArtsSearch: asciiWorkerOneLineArtsSearchWindow,
  oneLineArtsLibrary: asciiWorkerOneLineArtLibraryWindow
}