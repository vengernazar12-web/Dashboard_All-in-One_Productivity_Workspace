const translatorAiWrap = document.querySelector('div.translator-ai-wrap');
// Open
const openTranslatorAiBtn = allDashboardItem.querySelector('button.open-translator-ai-wrap');
openTranslatorAiBtn.addEventListener('click', () => {
  closeAllWraps();
  translatorAiWrap.classList.add('show');

  history.pushState(null, null, '#translatorAi');
})

const translatorAiLoader = translatorAiWrap.querySelector('span.loader');

const translatorAiFirstLangTextarea = translatorAiWrap.querySelector('textarea');
translatorAiFirstLangTextarea.addEventListener('input', () => {
  translatorAiFirstLangTextarea.style.height = 'auto';
  translatorAiFirstLangTextarea.style.height = `${translatorAiFirstLangTextarea.scrollHeight + 2}px`;
});

const translatorAiSelectTargetLang = translatorAiWrap.querySelector('.target-language-cont > select');

const translatorAiTargetLangResultCont = translatorAiWrap.querySelector('.target-language-cont > div.result');
translatorAiTargetLangResultCont.addEventListener('click', async () => {
  await navigator.clipboard.writeText(translatorAiTargetLangResultCont.textContent);
  showResponseFn('Copied!');
})

const translatorAiSendBtn = translatorAiWrap.querySelector('button.send');
translatorAiSendBtn.addEventListener('click', async () => {
  const text = translatorAiFirstLangTextarea.value.trim();
  if (!text) return;
  if (text.length > 1500) return showResponseFn(`Your text is too long (${text.length}/1500)`);
  if (!/[\p{L}]/u.test(text)) return translatorAiTargetLangResultCont.textContent = text;

  const targetLanguage = translatorAiSelectTargetLang.value;
  if (!targetLanguage) return showResponseFn('Please set a target language');

  translatorAiLoader.style.display = 'block';
  translatorAiTargetLangResultCont.textContent = 'Translating...';
  translatorAiSendBtn.disabled = true;

  try {
    translatorAiTargetLangResultCont.textContent = await fetch('https://translator-ai.dark-backend.workers.dev/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLanguage })
    }).then(r => r.text());;
  } catch (e) { translatorAiTargetLangResultCont.textContent = `Error: ${e.message}`; }
  finally {
    translatorAiLoader.style.display = 'none';
    translatorAiSendBtn.disabled = false;
  }
});