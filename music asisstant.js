const historyForMusicAssistant = [];

const musicAssistantWindow = musicWrap.querySelector('.music-assistant-window');
// Toggle
const toggleMusicAssistantWindow = musicWrap.querySelector('.toggle-music-assistant-window');
toggleMusicAssistantWindow.addEventListener('click', () => musicAssistantWindow.classList.toggle('open'));

const musicAssistantAnswerContainer = musicAssistantWindow.querySelector('.assistant-answer-container');
const musicAssistantLoader = musicAssistantWindow.querySelector('.assistant-loader');

// User prompt
const musicAssistantPromptTextarea = musicAssistantWindow.querySelector('.user-prompt-textarea');
musicAssistantPromptTextarea.addEventListener('input', () => {
  musicAssistantPromptTextarea.style.height = '30px';
  musicAssistantPromptTextarea.style.height = `${musicAssistantPromptTextarea.scrollHeight + 3}px`;

  const val = musicAssistantPromptTextarea.value.trim();
  sendMusicPromptBtn.style.border = `1px solid ${val.length > 1000 ? 'red' : 'silver'}`;
  sendMusicPromptBtn.textContent = val ? '=>' : '🗣';
})

const sendMusicPromptBtn = musicAssistantWindow.querySelector('.send-prompt-btn');
sendMusicPromptBtn.addEventListener('click', async () => {
  const userTxt = musicAssistantPromptTextarea.value.trim();
  if(!userTxt) return initSpeakWindow(musicAssistantPromptTextarea);
  if(userTxt.length > 1000) return showResponseFn('Your question is too long (more than 1000 characters)');

  musicAssistantPromptTextarea.value = '';
  musicAssistantPromptTextarea.style.height = '30px';
  sendMusicPromptBtn.textContent = '🗣';

  // Create user text
  const div = document.createElement('div'),
  pre = document.createElement('pre');

  div.classList.add('user-text');
  pre.textContent = userTxt;
  div.appendChild(pre);
  musicAssistantAnswerContainer.appendChild(div);
  musicAssistantAnswerContainer.scrollTop = musicAssistantAnswerContainer.scrollHeight;
  // -------

  historyForMusicAssistant.push({role: 'user', content: userTxt});
  if(historyForMusicAssistant.length > 7) historyForMusicAssistant.shift();

  let aiResp = await getMusicAssistantResp();

  const setCommand = (aiResp.match(/\?set\|.+\|set\?/s) || '')[0];
  if(setCommand) {
    try {
      let setCommandArr = JSON.parse(setCommand.replace(/\?set\||\|set\?/g, ''));
      if(!Array.isArray(setCommandArr)) setCommandArr = [setCommandArr];
      initUndoActionBlock('music', allMusicObj);
      for(let obj of setCommandArr) setContent('music', obj.name, obj.content);

      addUnsavedMarkAndRenderInitWrap();
      writeToUserActions('Дію зроблено music асистентом');
    } catch(e) {
      console.error(e);
      createUrlsAssistantResponse('Something went wrong, please try again later...');
    }
  }

  createMusicAssistantResp(aiResp);
})

// Create music assistant response text
let musicAssistantTypingInterval = null;
let musicAssistantTypingEl = null;
let musicAssistantTypingTxt = null;
function createMusicAssistantResp(txt) {
  if(musicAssistantTypingInterval) {
    clearInterval(musicAssistantTypingInterval);
    musicAssistantTypingInterval = null;
    musicAssistantTypingEl.textContent = musicAssistantTypingTxt;
    musicAssistantAnswerContainer.scrollTop = musicAssistantAnswerContainer.scrollHeight;
  }

  const div = document.createElement('div'),
  pre = document.createElement('pre');
  div.appendChild(pre);
  musicAssistantAnswerContainer.appendChild(div);

  musicAssistantTypingEl = pre;
  musicAssistantTypingTxt = txt.replace(/\?set\|.+\|set\?/s, '• Done');
  const txtLng = musicAssistantTypingTxt.length;

  historyForMusicAssistant.push({role: 'assistant', content: txt});
  if(historyForMusicAssistant.length > 7) historyForMusicAssistant.shift();

  let c = 0;
  musicAssistantTypingInterval = setInterval(() => {
    c += Math.floor(Math.random() * 5 + 1);
    musicAssistantTypingEl.textContent = musicAssistantTypingTxt.slice(0, c);
    musicAssistantAnswerContainer.scrollTop = musicAssistantAnswerContainer.scrollHeight;
    if(c > txtLng) {
      clearInterval(musicAssistantTypingInterval);
      musicAssistantTypingInterval = null;
      musicAssistantTypingEl.textContent = musicAssistantTypingTxt;
      musicAssistantAnswerContainer.scrollTop = musicAssistantAnswerContainer.scrollHeight;
    }
  }, 20);
}