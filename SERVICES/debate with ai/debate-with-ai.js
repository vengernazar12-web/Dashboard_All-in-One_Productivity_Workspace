const debateWithAi_URL = 'https://ai-debate-battle.dark-backend.workers.dev';

const debateWithAiWrap = document.querySelector('div.debate-with-ai-wrap');
// Open
const openDebateWithAiBtn = allDashboardItem.querySelector('button.open-debate-with-ai-wrap');
openDebateWithAiBtn.addEventListener('click', async () => {
  closeAllWraps();
  debateWithAiWrap.classList.add('show');

  history.pushState(null, null, '#debate');

  if(!debateWithAiInfo.topic) {
    debateWithAiLoader.style.display = 'block';

    const aiResult = await fetch(`${debateWithAi_URL}?need=get_debate`)
      .then(r => r.text());

    if(aiResult) {
      debateWithAiGenerateTopic.firstElementChild.textContent = aiResult;
      debateWithAiInfo.topic = aiResult;
    }

    debateWithAiLoader.style.display = 'none';

    for(const btn of debateWithAiGenerateTopic.querySelectorAll('button.select-topic')) btn.disabled = false;
  }
})

const debateWithAiLoader = debateWithAiWrap.querySelector('span.loader');

// Generate topic
const debateWithAiInfoEl = debateWithAiWrap.querySelector('p.info');

const debateWithAiInfo = {
  topic: null,
  user_side: null
};
const debateWithAiGenerateTopic = debateWithAiWrap.querySelector('div.generate-topic-wrap');
debateWithAiGenerateTopic.addEventListener('click', e => {
  const target = e.target;

  if(target.tagName === 'BUTTON' && target.classList.contains('select-topic')) {
    if(!debateWithAiInfo.topic || !debateWithAiInfo.user_side) return;

    const side = target.dataset.pos;
    if(side) debateWithAiInfo.user_side = side;
    debateWithAiGenerateTopic.classList.remove('open');

    debateWithAiInfoEl.innerHTML = `Debate: <strong>${hashHtmlSymbols(debateWithAiInfo.topic)}</strong>, your side: <strong>${side}</strong>`;

    debateWithAiUserArgInput.disabled = false;
    debateWithAiSendArgBtn.disabled = false;
  }
})

// Game logic
const debateWithAiHistory = [];
const debateWithAiHistoryCont = debateWithAiWrap.querySelector('div.history');
const debateWithAiUserArgInput = debateWithAiWrap.querySelector('input');

const debateWithAiWinOrLossEl = debateWithAiWrap.querySelector('p.win-or-loss-show');
debateWithAiWrap.addEventListener('animationend', () => debateWithAiWinOrLossEl.classList.remove('open'));

const debateWithAiSendArgBtn = debateWithAiWrap.querySelector('button.send');
debateWithAiSendArgBtn.addEventListener('click', async () => {
  const userArg = debateWithAiUserArgInput.value.trim();
  if(!userArg || !debateWithAiInfo.topic || !debateWithAiInfo.user_side) return;
  if(userArg.length > 300) return showResponseFn('Your argument is too long (>300)');

  const userPre = document.createElement('pre');
  userPre.classList.add('user');
  userPre.textContent = userArg;
  debateWithAiHistoryCont.appendChild(userPre);

  debateWithAiUserArgInput.value = '';

  debateWithAiHistory.push({ role: 'user', content: userArg });

  debateWithAiLoader.style.display = 'block';
  debateWithAiSendArgBtn.disabled = true;

  try {
    const aiAns = await fetch(`${debateWithAi_URL}?need=ai_step`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        history: debateWithAiHistory,
        debate: debateWithAiInfo.topic,
        user_side: debateWithAiInfo.user_side
      })
    }).then(r => r.json());

    const win = aiAns.win, loss = aiAns.loss;
    const for_show = aiAns.for_show, for_history = aiAns.for_history;

    if(win || loss) {
      debateWithAiSendArgBtn.disabled = true;
      debateWithAiUserArgInput.disabled = true;

      debateWithAiInfo.topic = null;
      debateWithAiInfo.user_side = null;

      for(const btn of debateWithAiGenerateTopic.querySelectorAll('button.select-topic')) btn.disabled = true;

      if(loss) {
        debateWithAiWinOrLossEl.textContent = 'You lost!';
        debateWithAiWinOrLossEl.style.color = 'red';
        debateWithAiWinOrLossEl.classList.add('open');

        const aiPre = document.createElement('pre');
        aiPre.classList.add('is-ai-text');
        aiPre.innerHTML = `${for_show}\n\n<button onClick="debateWithAiGenerateTopic.classList.add('open'); debateWithAiHistoryCont.textContent = ''; openDebateWithAiBtn.click();">RESTART</button>`;
        debateWithAiHistoryCont.appendChild(aiPre);
      } else {
        debateWithAiWinOrLossEl.textContent = 'You won!';
        debateWithAiWinOrLossEl.style.color = 'green';
        debateWithAiWinOrLossEl.classList.add('open');
        const aiPre = document.createElement('pre');
        aiPre.classList.add('is-ai-text');
        aiPre.innerHTML = `You won!\n\n<button onClick="debateWithAiGenerateTopic.classList.add('open'); debateWithAiHistoryCont.textContent = ''; openDebateWithAiBtn.click();">RESTART</button>`;
        debateWithAiHistoryCont.appendChild(aiPre);
      }
    }

    else {
      debateWithAiHistory.push({ role: 'assistant', content: for_history });
      const aiPre = document.createElement('pre');
      aiPre.classList.add('is-ai-text');
      aiPre.innerHTML = for_show;
      debateWithAiHistoryCont.appendChild(aiPre);
    }
  } catch (e) {
    debateWithAiHistory.push({ role: 'assistant', content: e.message });
    const aiPre = document.createElement('pre');
    aiPre.classList.add('is-ai-text');
    aiPre.textContent = e.message;
    debateWithAiHistoryCont.appendChild(aiPre);
  } finally {
    debateWithAiLoader.style.display = 'none';
    debateWithAiSendArgBtn.disabled = false;
  }
})