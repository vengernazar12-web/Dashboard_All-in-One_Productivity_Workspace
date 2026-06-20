const tokenCounterModels = [
  { "gpt2 models": ["gpt2"] },
  {
    "cushman code models": ["code-cushman-001", "code-cushman-002", "cushman-codex"]
  },
  {
    "davinci code models": ["code-davinci-001", "code-davinci-002", "davinci-codex", "code-davinci-edit-001"]
  },
  {
    "davinci text models": ["davinci-002", "text-davinci-002", "text-davinci-003", "text-davinci-edit-001", "davinci", "text-davinci-001"]
  },
  {
    "ada models": ["ada", "code-search-ada-code-001", "text-ada-001", "text-search-ada-doc-001", "text-similarity-ada-001"]
  },
  {
    "babbage models": ["babbage", "babbage-002", "code-search-babbage-code-001", "text-babbage-001", "text-search-babbage-doc-001", "text-similarity-babbage-001"]
  },
  {
    "curie models": ["curie", "text-curie-001", "text-search-curie-doc-001", "text-similarity-curie-001"]
  },
  {
    "gpt-3.5 turbo models": [
      "gpt-3.5-turbo-instruct-0914",
      "gpt-3.5-turbo-instruct",
      "gpt-3.5-turbo-16k-0613",
      "gpt-3.5-turbo-16k",
      "gpt-3.5-turbo-0613",
      "gpt-3.5-turbo-0301",
      "gpt-3.5-turbo",
      "gpt-3.5-turbo-1106",
      "gpt-35-turbo",
      "gpt-3.5-turbo-0125"
    ]
  },
  {
    "gpt-4 models": [
      "gpt-4-32k-0613",
      "gpt-4-32k-0314",
      "gpt-4-32k",
      "gpt-4-0613",
      "gpt-4-0314",
      "gpt-4",
      "gpt-4-1106-preview",
      "gpt-4-vision-preview",
      "gpt-4-turbo",
      "gpt-4-turbo-2024-04-09",
      "gpt-4-turbo-preview",
      "gpt-4-0125-preview",
      "gpt-4.1",
      "gpt-4.1-2025-04-14",
      "gpt-4.1-mini",
      "gpt-4.1-mini-2025-04-14",
      "gpt-4.1-nano",
      "gpt-4.1-nano-2025-04-14",
      "gpt-4.5-preview",
      "gpt-4.5-preview-2025-02-27"
    ]
  },
  {
    "gpt-4o models": [
      "gpt-4o",
      "gpt-4o-2024-05-13",
      "gpt-4o-2024-08-06",
      "gpt-4o-2024-11-20",
      "gpt-4o-mini-2024-07-18",
      "gpt-4o-mini",
      "gpt-4o-search-preview",
      "gpt-4o-search-preview-2025-03-11",
      "gpt-4o-mini-search-preview",
      "gpt-4o-mini-search-preview-2025-03-11",
      "gpt-4o-audio-preview",
      "gpt-4o-audio-preview-2024-12-17",
      "gpt-4o-audio-preview-2024-10-01",
      "gpt-4o-mini-audio-preview",
      "gpt-4o-mini-audio-preview-2024-12-17",
      "chatgpt-4o-latest",
      "gpt-4o-realtime",
      "gpt-4o-realtime-preview-2024-10-01",
      "gpt-4o-realtime-preview-2024-12-17",
      "gpt-4o-mini-realtime-preview",
      "gpt-4o-mini-realtime-preview-2024-12-17"
    ]
  },
  {
    "embedding models": [
      "text-embedding-ada-002",
      "text-embedding-3-small",
      "text-embedding-3-large"
    ]
  },
  {
    "o1 models": [
      "o1",
      "o1-2024-12-17",
      "o1-mini",
      "o1-mini-2024-09-12",
      "o1-preview",
      "o1-preview-2024-09-12",
      "o1-pro",
      "o1-pro-2025-03-19"
    ]
  },
  {
    "o3 models": [
      "o3",
      "o3-2025-04-16",
      "o3-mini",
      "o3-mini-2025-01-31"
    ]
  },
  {
    "o4 models": [
      "o4-mini",
      "o4-mini-2025-04-16"
    ]
  },
  {
    "gpt-5 models": [
      "gpt-5",
      "gpt-5-2025-08-07",
      "gpt-5-nano",
      "gpt-5-nano-2025-08-07",
      "gpt-5-mini",
      "gpt-5-mini-2025-08-07",
      "gpt-5-chat-latest"
    ]
  }
];

const tokenCounterWrap = document.querySelector('.token-counter-wrap');
// Open
let isTokenCounterLoaded = false;
const openTokenCounterBtn = allDashboardItem.querySelector('.open-token-counter-wrap')
openTokenCounterBtn.addEventListener('click', async () => {
  closeAllWraps();
  history.pushState({}, null, '#token-counter');

  if (!isTokenCounterLoaded) {
    try {
      showPreloader();
      whatIsLoadingText.textContent = 'Loading token counter...';
      preloaderProgress.max = 1;
      preloaderProgress.value = 0;

      window.tokenCountLib = await import('https://esm.sh/js-tiktoken');
      tokenCounterSelectModel.innerHTML = tokenCounterModels.map(modelObj => {
        const familyName = Object.keys(modelObj)[0];
        const family = modelObj[familyName];

        return `<option value='${family[0]}'>${familyName}</option>`;
      });

      preloaderProgress.value = 1;
      isTokenCounterLoaded = true;
      setTimeout(() => showPreloader(false), 500);
    } catch (e) { showPreloader(false); showResponseFn(`Error: ${e.message}`); }
  }

  tokenCounterWrap.classList.add('show');
})

const tokenCounterLoader = tokenCounterWrap.querySelector('.loader');
const tokeCounterResultCont = tokenCounterWrap.querySelector('div');

const tokenCounterSelectModel = tokenCounterWrap.querySelector('select');
tokenCounterSelectModel.addEventListener('change', () => tokenCounterInitResult());

const tokenCounterTextarea = tokenCounterWrap.querySelector('textarea');
tokenCounterTextarea.addEventListener('input', () => tokenCounterInitResult());

const tokenCounterRenderObserver = new IntersectionObserver(entries => {
  const element = entries[0];
  if(element.isIntersecting) {
    tokeCounterResultCont.querySelector('p.enc-tokens')?.append(document.createTextNode((tokenCounterCachedTokensForRender.slice(tokenCounterCachedTokensIdxForRender, tokenCounterCachedTokensIdxForRender + 500).join(' ') || ' ') + ' '));
    tokenCounterCachedTokensIdxForRender += 500;
  };
  if(!tokenCounterCachedTokensForRender.length) tokenCounterRenderObserver.unobserve(element.target);
})

let tokenCounterRenderTimer = null;

let tokenCounterCachedTokensForRender = [];
let tokenCounterCachedTokensIdxForRender = 0;

function tokenCounterInitResult() {
  tokenCounterLoader.style.display = 'block';

  clearTimeout(tokenCounterRenderTimer);
  tokenCounterRenderTimer = setTimeout(() => {
    const model = tokenCounterSelectModel.value;
    if (!model) return showResponseFn('Please select AI model');

    const text = tokenCounterTextarea.value;

    const tokenCountLib = window.tokenCountLib;

    const enc = tokenCountLib.encodingForModel(model);
    tokenCounterCachedTokensForRender = enc.encode(text);

    const h3 = document.createElement('h3'),
      h4 = document.createElement('h4'),
      br = document.createElement('br'),
      p = document.createElement('p'),
      spanForScrollRender = document.createElement('span');

    h3.textContent = `Tokens: ${tokenCounterCachedTokensForRender.length}`;
    h4.textContent = `Characters: ${text.length}`;

    p.textContent = tokenCounterCachedTokensForRender.slice(0, 500).join(' ') + ' ';
    tokenCounterCachedTokensIdxForRender = 500;
    p.classList.add('enc-tokens');

    spanForScrollRender.classList.add('for-render');
    tokenCounterRenderObserver.observe(spanForScrollRender);

    tokeCounterResultCont.replaceChildren(h3, h4, br, p, spanForScrollRender);

    tokenCounterLoader.style.display = 'none';
  }, 1500);
}