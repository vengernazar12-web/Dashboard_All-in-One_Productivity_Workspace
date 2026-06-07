const TEXT_TO_SPEECH_API = 'https://text-to-speach.vengernazar0.workers.dev';

const textToSpeechWrap = document.querySelector('.text-to-speech-wrap');
// Open
const openTextToSpeechBtn = allDashboardItem.querySelector('.open-text-to-speech-wrap');
openTextToSpeechBtn.addEventListener('click', async () => {
  closeAllWraps();

  if(!textToSpeechSelectVoice.childElementCount) {
    showPreloader();
    preloaderProgress.max = 1;
    preloaderProgress.value = 0;
    whatIsLoadingText.textContent = 'Loading voice types...';

    try { await renderTextToSpeechSelect(); } catch(e) {
      showPreloader(false);
      console.log(e);
      return showResponseFn('Something went wrong... Please try again later...');
    }

    preloaderProgress.value = 1;
    setTimeout(() => showPreloader(false), 500);
  }

  textToSpeechWrap.classList.add('show');
})

const textToSpeechLoader = textToSpeechWrap.querySelector('span.loader');

const textToSpeechSelectVoice = textToSpeechWrap.querySelector('select');
const textToSpeechTextarea = textToSpeechWrap.querySelector('textarea');

const textToSpeechBtn = textToSpeechWrap.querySelector('button');
textToSpeechBtn.addEventListener('click', async () => {
  const text = textToSpeechTextarea.value.trim();
  if(text.length > 500) return showResponseFn('Text is too long (>500 symbols)');

  textToSpeechLoader.style.display = 'block';
  textToSpeechBtn.disabled = true;
  textToSpeechAudio.src = '';

  const voiceId = textToSpeechSelectVoice.value;

  try {
    const src = await fetch(TEXT_TO_SPEECH_API, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        need: 'text-to-speech',
        text, voiceId
      })
    }).then(r => r.ok ? r.text() : r.json())
      .then(b => !b.error ? b : showResponseFn(`Error: ${b.error}`));

    if(src) textToSpeechAudio.src = src;
    else showResponseFn('Please wait a moment... Try again please...');
  } catch (e) { showResponseFn(`Error: ${e.message}`) }
  finally {
    textToSpeechLoader.style.display = 'none';
    textToSpeechBtn.disabled = false;
  }
})

const textToSpeechAudio = textToSpeechWrap.querySelector('audio');

async function renderTextToSpeechSelect() {
  textToSpeechSelectVoice.innerHTML = await fetch(TEXT_TO_SPEECH_API, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ need: 'voices-list' })
  }).then(r => r.json())
  .then(list => list.voices.map(voice => `<option value="${voice.id}">${voice.name} (${voice.language.toUpperCase()} • ${voice.gender})</option>`));
}