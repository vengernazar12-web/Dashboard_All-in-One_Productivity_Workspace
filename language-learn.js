const languageLearnLANGUAGES = [ 'English', 'Ukrainian', 'German', 'French', 'Spanish', 'Italian', 'Portuguese', 'Polish', 'Czech', 'Dutch', 'Russian', 'Turkish', 'Japanese', 'Korean', 'Chinese' ];

const languageLearnWrap = document.querySelector('.language-learn-ai-wrap');
// Open
const openLanguageLearnBtn = allDashboardItem.querySelector('.open-language-learn-ai-wrap');
openLanguageLearnBtn.addEventListener('click', () => {
  closeAllWraps();
  languageLearnWrap.classList.add('show');

  history.pushState(null, null, '#languageLearning');

  const langsSelectHtml = languageLearnLANGUAGES.map(lng => `<option value='${lng}'>${lng}</option>`);
  languageLearnNativeLngSelect.innerHTML = langsSelectHtml;
  languageLearnTargetLngSelect.innerHTML = langsSelectHtml;

  const savedNative = localStorage.getItem('native_language') || 'English';
  const savedTarget = localStorage.getItem('target_language') || 'Ukrainian';

  languageLearnNativeLngSelect.value = savedNative;
  languageLearnTargetLngSelect.value = savedTarget;
});

const languageLearnLoader = languageLearnWrap.querySelector('.loader');

// Game interface
const languageLearnLevelPreviewP = languageLearnWrap.querySelector('p.level-preview');
const languageLearnLanguagesPreviewP = languageLearnWrap.querySelector('p.languages-preview');
const languageLearnResultCont = languageLearnWrap.querySelector('div.ai-text');
const languageLearnUserFeedbackTextarea = languageLearnWrap.querySelector('textarea');

const languageLearnSendBtn = languageLearnWrap.querySelector('button.send');
languageLearnSendBtn.addEventListener('click', async () => {
  const userFeedback = languageLearnUserFeedbackTextarea.value.trim();
  if(!userFeedback) return showResponseFn('Please provide feedback');
  if(userFeedback.length > 1250) return showResponseFn('Your feedback is too long (>1250)');

  languageLearnUserFeedbackTextarea.value = '';

  await goLanguageLearnGameRound(userFeedback);
})

// Game settings
const languageLearnSettingsWrap = languageLearnWrap.querySelector('div.learn-settings');

const languageLearnNativeLngSelect = languageLearnSettingsWrap.querySelector('select#native');
languageLearnNativeLngSelect.addEventListener('change', () => {
  const savedNative = localStorage.getItem('native_language') || 'English';
  const savedTarget = localStorage.getItem('target_language') || 'Ukrainian';

  const selectedNative = languageLearnNativeLngSelect.value;

  if(selectedNative === savedTarget) {
    if(!confirm('Changing your target language will clear your level!')) return languageLearnNativeLngSelect.value = savedNative;

    languageLearnTargetLngSelect.value = savedNative;
    localStorage.setItem('target_language', savedNative);
    localStorage.setItem('language_level', '0');
    localStorage.setItem('language_learn_history', '');
  };

  localStorage.setItem('native_language', selectedNative);
})

const languageLearnTargetLngSelect = languageLearnSettingsWrap.querySelector('select#target');
languageLearnTargetLngSelect.addEventListener('change', () => {
  const savedNative = localStorage.getItem('native_language') || 'English';
  const savedTarget = localStorage.getItem('target_language') || 'Ukrainian';

  if(!confirm('Changing your target language will clear your level!')) return languageLearnTargetLngSelect.value = savedTarget;

  const selectedTarget = languageLearnTargetLngSelect.value;

  if(selectedTarget === savedNative) {
    languageLearnNativeLngSelect.value = savedTarget;
    localStorage.setItem('native_language', savedTarget);
  }

  localStorage.setItem('target_language', selectedTarget);
  localStorage.setItem('language_level', '0');
  localStorage.setItem('language_learn_history', '');
})

const acceptLanguageLearnSettingsBtn = languageLearnSettingsWrap.querySelector('button.ok');
acceptLanguageLearnSettingsBtn.addEventListener('click', () => {
  languageLearnSettingsWrap.classList.remove('show');

  const savedNative = localStorage.getItem('native_language') || 'English';
  const savedTarget = localStorage.getItem('target_language') || 'Ukrainian';

  const savedLevel = localStorage.getItem('language_level') || '0';
  languageLearnLevelPreviewP.textContent = `Level: ${savedLevel}`;

  languageLearnLanguagesPreviewP.textContent = `${savedNative} → ${savedTarget}`;

  let savedHistory = localStorage.getItem('language_learn_history');

  if(!savedHistory) return goLanguageLearnGameRound();
  else {
    savedHistory = JSON.parse(savedHistory);
    const lastMessage = savedHistory[savedHistory.length - 1];
    if(lastMessage.role !== 'assistant' || !lastMessage.content) {
      localStorage.setItem('language_learn_history', '');
      return goLanguageLearnGameRound();
    }

    const lastAssistantText = lastMessage.content;
    languageLearnResultCont.innerHTML = renderMarkdown(lastAssistantText);
    languageLearnContextHistory = savedHistory;
  }
})

// Go game FN
let languageLearnContextHistory = [{ role: 'user', content: 'SYSTEM: Start' }];
async function goLanguageLearnGameRound(userFeedback = null) {
  languageLearnLoader.style.display = 'block';
  languageLearnSendBtn.disabled = true;
  languageLearnResultCont.textContent = 'AI...';

  const initLevel = +localStorage.getItem('language_level') || 0;

  const savedNative = localStorage.getItem('native_language') || 'English';
  const savedTarget = localStorage.getItem('target_language') || 'Ukrainian';

  try {
    if(userFeedback) languageLearnContextHistory.push({ role: 'user', content: userFeedback });

    languageLearnContextHistory = languageLearnContextHistory.slice(-22);

    const AIAnswer = await fetch('https://language-learning-game.dark-backend.workers.dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        context: languageLearnContextHistory,
        initLevel,
        native: savedNative, target: savedTarget
      })
    }).then(r => r.json());

    const for_show = AIAnswer.for_show;
    const for_history = AIAnswer.for_history;
    const new_level = AIAnswer.new_level;
    if(new_level) {
      languageLearnContextHistory.push({ role: 'assistant', tool_calls: AIAnswer.tool_calls.slice(0, 1) });
      languageLearnContextHistory.push({ role: 'tool', content: `Level updated! New level ${new_level}`, tool_call_id: AIAnswer.tool_calls[0].id });

      showResponseFn(`The AI has decided to change your level to ${new_level}`);
      localStorage.setItem('language_level', new_level);
      languageLearnLevelPreviewP.textContent = `Level: ${new_level}`;
    }

    languageLearnResultCont.innerHTML = for_show;

    languageLearnContextHistory.push({ role: 'assistant', content: for_history });
    localStorage.setItem('language_learn_history', JSON.stringify(languageLearnContextHistory));
  } catch(e) {
    languageLearnResultCont.textContent = e.message;
    languageLearnContextHistory.push({ role: 'assistant', content: e.message });
  } finally {
    languageLearnLoader.style.display = 'none';
    languageLearnSendBtn.disabled = false;
  }
}