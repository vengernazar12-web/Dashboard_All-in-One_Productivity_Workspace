const tokenCounterModels = {
  "gpt2 models": { model: "gpt2", type: 'openAI' },
  "cushman code models": { model: "cushman-codex", type: 'openAI' },
  "davinci code models": { model: "davinci-codex", type: 'openAI' },
  "davinci text models": { model: "davinci", type: 'openAI' },
  "ada models": { model: "text-ada-001", type: 'openAI' },
  "babbage models": { model: "babbage", type: 'openAI' },
  "curie models": { model: "curie", type: 'openAI' },
  "gpt-3.5 turbo models": { model: "gpt-3.5-turbo-instruct", type: 'openAI' },
  "gpt-4 models": { model: "gpt-4", type: 'openAI' },
  "gpt-4o models": { model: "gpt-4o", type: 'openAI' },
  "embedding models": { model: "text-embedding-3-large", type: 'openAI' },
  "o1 models": { model: "o1-pro", type: 'openAI' },
  "o3 models": { model: "o3", type: 'openAI' },
  "o4 models": { model: "o4-mini", type: 'openAI' },
  "gpt-5 models": { model: "gpt-5-chat-latest", type: 'openAI' },

  "Google FLAN-T5": { type: "hf", model: "google/flan-t5-base" },

  "TinyLlama": { type: "hf", model: "TinyLlama/TinyLlama-1.1B-Chat-v1.0" },

  "Alibaba Qwen": { type: "hf", model: "Qwen/Qwen2.5-0.5B" },
  "Alibaba Qwen 3": { type: "hf", model: "Qwen/Qwen3-0.6B" },

  "DeepSeek (Qwen tokenizer)": { type: "hf", model: "deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B" },
  "DeepSeek (Llama tokenizer)": { type: "hf", model: "deepseek-ai/DeepSeek-R1-Distill-Llama-8B" },

  "Mistral": { type: "hf", model: "mistralai/Mistral-7B-Instruct-v0.3" },
  "Mixtral": { type: "hf", model: "mistralai/Mixtral-8x7B-Instruct-v0.1" },

  "Microsoft Phi": { type: "hf", model: "microsoft/Phi-3-mini-4k-instruct" },
  "Microsoft Phi Medium": { type: "hf", model: "microsoft/Phi-3-medium-4k-instruct" },

  "IBM Granite": { type: "hf", model: "ibm-granite/granite-3.1-8b-instruct" },

  "Falcon": { type: "hf", model: "tiiuae/falcon-7b-instruct" },

  "Yi": { type: "hf", model: "01-ai/Yi-6B" },

  "StarCoder 2": { type: "hf", model: "bigcode/starcoder2-3b" },
  "SantaCoder": { type: "hf", model: "bigcode/santacoder" },

  "Bloom": { type: "hf", model: "bigscience/bloom-560m" },

  "GPT-NeoX": { type: "hf", model: "EleutherAI/gpt-neox-20b" },
  "GPT-J": { type: "hf", model: "EleutherAI/gpt-j-6b" },
};

let tokenCounterOpenAILib = null,
  tokenCounterHFLib = null;

const tokenCounterWrap = document.querySelector('.token-counter-wrap');
// Open
let isTokenCounterLoaded = false;
const openTokenCounterBtn = allDashboardItem.querySelector('.open-token-counter-wrap')
openTokenCounterBtn.addEventListener('click', async () => {
  closeAllWraps();
  history.pushState({}, null, '#aiTokenCounter');

  if (!isTokenCounterLoaded) {
    try {
      showPreloader();
      whatIsLoadingText.textContent = 'Loading token counter...';
      preloaderProgress.max = 1;
      preloaderProgress.value = 0;

      tokenCounterOpenAILib = await import('https://esm.sh/js-tiktoken');
      tokenCounterHFLib = await import("https://esm.sh/@huggingface/transformers").then(lib => lib.AutoTokenizer);
      tokenCounterSelectModel.innerHTML = Object.keys(tokenCounterModels).map(modelsFamily =>`<option value='${tokenCounterModels[modelsFamily].model}'>${modelsFamily}</option>` );

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
  tokenCounterRenderTimer = setTimeout(async () => {
    const model = tokenCounterSelectModel.value;
    if (!model) return showResponseFn('Please select AI model');

    const text = tokenCounterTextarea.value;

    const type = tokenCounterModels[
      Object.keys(tokenCounterModels) // Search correct family for model
        .find(family => tokenCounterModels[family].model === model)
    ].type;

    const enc = type === 'openAI'
      ? tokenCounterOpenAILib.encodingForModel(model)
      : await tokenCounterHFLib.from_pretrained(model);

    tokenCounterCachedTokensForRender = type === 'openAI'
      ? enc.encode(text)
      : Array.from(
        enc(text).input_ids.ort_tensor.cpuData,
        Number
      );;

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
  }, 500);
}