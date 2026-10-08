let guessingGameId = null;

const guessingWrap = document.querySelector('div.guessing-game-wrap');
// Open
const openGuessingBtn = allDashboardItem.querySelector('.open-guessing-game-wrap');
openGuessingBtn.addEventListener('click', async () => {
  closeAllWraps();
  guessingWrap.classList.add('show');

  history.pushState(null, null, '#guessing');

  if(!guessingGameId) {
    guessingGameId = crypto.randomUUID();

    try {
      const started = await fetch('https://guessing-game.dark-backend.workers.dev/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: guessingGameId })
      }).then(r => r.json()).then(d => d.started);

      if(started) {
        const guess = document.createElement('div');
        guess.innerHTML = `<h3>GAME STARTED</h3>`;
        guessingHistoryCont.appendChild(guess);

        guessingHistoryCont.scrollTop = guessingHistoryCont.scrollHeight;

        guessingUserAskInput.disabled = false;
        guessingSendBtn.disabled = false;
        guessingRestartBtn.disabled = false;
        guessingLoader.style.display = 'none';
      }
    } catch(e) {
      showResponseFn(`Error: ${e.message}`);
    }
  }
})

// GAME
const guessingLoader = guessingWrap.querySelector('span.loader');
const guessingHistoryCont = guessingWrap.querySelector('div.history');
const guessingUserAskInput = guessingWrap.querySelector('input');

const guessingRestartBtn = guessingWrap.querySelector('button.restart');
guessingRestartBtn.addEventListener('click', () => restartGuessingGame());

const guessingSendBtn = guessingWrap.querySelector('button.send');
guessingSendBtn.addEventListener('click', async () => {
  const value = guessingUserAskInput.value.trim();
  if(!guessingGameId || !value) return;
  if(value.length > 100) return showResponseFn('Your text is too long (>100)');

  guessingUserAskInput.disabled = true;
  guessingSendBtn.disabled = true;
  guessingLoader.style.display = 'block';
  guessingUserAskInput.value = '';
  guessingRestartBtn.disabled = true;

  try {
    const aiResp = await fetch('https://guessing-game.dark-backend.workers.dev/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId: guessingGameId, userTxt: value })
    }).then(r => r.json());

    guessingLoader.style.display = 'none';

    if (aiResp.answer) {
      const guess = document.createElement('div');
      guess.innerHTML = `<p>${value}</p><p>${aiResp.answer}</p>`;
      guessingHistoryCont.appendChild(guess);

      guessingUserAskInput.disabled = false;
      guessingSendBtn.disabled = false;
      guessingRestartBtn.disabled = false;
    }
    else if (aiResp.user_won) {
      const guess = document.createElement('div');
      guess.innerHTML = `<p>${value}</p><p style='color: green; text-decoration: underline'>YES! YOU GUESSED IT!</p><button onClick="restartGuessingGame()">RESTART</button>`;
      guessingHistoryCont.appendChild(guess);

      guessingUserAskInput.disabled = true;
      guessingSendBtn.disabled = true;
      guessingRestartBtn.disabled = true;
    }
  } catch (e) {
    const guess = document.createElement('div');
    guess.innerHTML = `<p>${value}</p><p>${e.message}</p>`;
    guessingHistoryCont.appendChild(guess);
  } finally { guessingHistoryCont.scrollTop = guessingHistoryCont.scrollHeight; }
})

function restartGuessingGame() {
  guessingGameId = null;
  guessingUserAskInput.disabled = true;
  guessingSendBtn.disabled = true;
  guessingLoader.style.display = 'block';
  guessingRestartBtn.disabled = true;

  openGuessingBtn.click();

  for(const btn of guessingHistoryCont.querySelectorAll('div > button')) btn.remove();
}