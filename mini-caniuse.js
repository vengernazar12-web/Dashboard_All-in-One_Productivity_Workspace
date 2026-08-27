const miniCaniuseWrap = document.querySelector('.mini-caniuse-wrap');
// Open
let caniuseData = null;

const openMiniCaniuseBtn = allDashboardItem.querySelector('.open-mini-caniuse-wrap');
openMiniCaniuseBtn.addEventListener('click', async () => {
  closeAllWraps();
  miniCaniuseWrap.classList.add('show');

  if(!caniuseData) {
    showPreloader();
    preloaderProgress.max = 1;
    preloaderProgress.value = 0;
    whatIsLoadingText.textContent = 'Loading data...';

    caniuseData = await fetch('https://get-caniuse-data.dark-backend.workers.dev/')
      .then(r => r.json());

    preloaderProgress.value = 1;
    setTimeout(() => showPreloader(false), 500);
  }

  history.pushState({}, null, '#browserSupport');
});

const miniCaniuseResultCont = miniCaniuseWrap.querySelector('div');
miniCaniuseResultCont.addEventListener('click', e => {
  const target = e.target;

  if(target.classList.contains('browser-state') && target.classList.contains('info')) {
    const info = target.dataset.info;
    showResponseFn(info);
  }
});

let caniuseDebounceTimer = null;
const miniCaniuseSearchInput = miniCaniuseWrap.querySelector('input');
miniCaniuseSearchInput.addEventListener('input', () => {
  const val = miniCaniuseSearchInput.value.trim().toLowerCase();
  if (!val) return miniCaniuseResultCont.innerHTML = '<h3>Start search</h3>';

  clearTimeout(caniuseDebounceTimer);
  caniuseDebounceTimer = setTimeout(() => {
    const data = caniuseData.data;
    const frag = document.createDocumentFragment();
    miniCaniuseResultCont.textContent = '';

    let maxCards = 25;

    for (const dataKey in data) {
      if(maxCards <= 0) break;

      const initObj = data[dataKey];

      if (
        dataKey.includes(val)
        || dataKey.replaceAll('-', ' ').includes(val)
        || initObj.description.toLowerCase().includes(val)
        || initObj.keywords.toLowerCase().includes(val)
        || initObj.notes?.toLowerCase().includes(val)
      ) {
        maxCards--;

        const card = document.createElement('div'),
          title = document.createElement('h3'),
          desc = document.createElement('p'),
          notes = document.createElement('small'),
          percent = document.createElement('span'),

          links = document.createElement('div'),
          browsers = document.createElement('div');

        card.classList.add('card');
        card.append(title, desc, initObj.notes?.trim() ? notes : '', percent, links, browsers);
        frag.appendChild(card);

        title.textContent = dataKey;
        desc.innerHTML = hashHtmlSymbols(initObj.description || '')
          .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
          .replace(/\[([^\]]+)\]\(([^\s)]+)\)/g, '<a href="https://caniuse.com$2" target="_blank">$1</a>')
          .replace(/(?<!`)`(?!`)(.+?)(?<!`)`(?!`)/g, '<code class="inline-code">$1</code>');

        if(initObj.notes?.trim()) notes.innerHTML = hashHtmlSymbols(initObj.notes || '')
          .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
          .replace(/\[([^\]]+)\]\(([^\s)]+)\)/g, '<a href="https://caniuse.com$2" target="_blank">$1</a>')
          .replace(/(?<!`)`(?!`)(.+?)(?<!`)`(?!`)/g, '<code class="inline-code">$1</code>');

        percent.classList.add('percent');
        percent.innerHTML = `Tracked users = ${initObj.usage_perc_y}% ${initObj.usage_perc_a ? `+ <span style='color: yellow;' title="Partial support">${initObj.usage_perc_a}%</span>` : ''}`.trim();

        links.classList.add('links');
        links.innerHTML = `
<a href="${initObj.spec}" target="_blank">Specification</a>
${initObj.links.map(({ url, title }) => `<a href="${url}" target="_blank">${title}</a>`).join('')}
`.trim();

        browsers.classList.add('browsers');

        const notesByNum = initObj.notes_by_num || {};

        for(const brId in initObj.stats) {
          const browser = document.createElement('div');
          browser.classList.add('browser');
          browsers.appendChild(browser);

          let min = null;
          let max = null;
          let state = null;

          const browserTitleBlock = document.createElement('div');
          browserTitleBlock.classList.add('browser-title');
          browserTitleBlock.textContent = brId;

          browser.appendChild(browserTitleBlock);

          for (const version of Object.keys(initObj.stats[brId]).sort((a, b) => {
            const aNum = /^[\d.]+$/.test(a.includes('-') ? a.split('-')[1] : a);
            const bNum = /^[\d.]+$/.test(b.includes('-') ? b.split('-')[1] : b);

            if (aNum && bNum) return Number(a) - Number(b);
            return 0;
          })) {
            const initState = initObj.stats[brId][version];

            if (state === null) {
              min = version.includes('-') ? version.split('-')[1] : version;
              state = initState;
            }
            else if (initState === state) max = version.includes('-') ? version.split('-')[1] : version;
            else {
              const browserStateBlock = document.createElement('div');
              browserStateBlock.className = `browser-state ${state}`;
              browserStateBlock.textContent = `${min} ${max && max !== min ? `– ${max}` : ''}`.trim();

              if(/#\d+$/.test(state)) {
                browserStateBlock.classList.add('info');
                browserStateBlock.dataset.info = notesByNum[state.match(/\d+$/)?.[0]];
              };

              browser.appendChild(browserStateBlock);

              min = version;
              max = null;
              state = initState;
            }
          }

          if (state !== null) {
            const browserStateBlock = document.createElement('div');
            browserStateBlock.className = `browser-state ${state}`;
            browserStateBlock.textContent = `${min} ${max && max !== min ? `– ${max}` : ''}`.trim();

            if (/#\d+$/.test(state)) {
              browserStateBlock.classList.add('info');
              browserStateBlock.dataset.info = notesByNum[state.match(/\d+$/)?.[0]];
            };

            browser.appendChild(browserStateBlock);
          }
        }
      }
    }

    miniCaniuseResultCont.appendChild(frag);
    if(!miniCaniuseResultCont.childElementCount) miniCaniuseResultCont.innerHTML = '<h3>Nothing found...</h3>'
  }, 500);
});