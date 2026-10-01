const mathGameWrap = document.querySelector('.math-game-wrap');
mathGameWrap.addEventListener('click', e => {
  const target = e.target;

  if (target.tagName === 'BUTTON' && target.classList.contains('difficulty')) {
    const dif = target.dataset.dif;
    if (dif) {
      mathGameInfo.lvl = dif;
      mathGameWindow.classList.add('show');
      localStorage.setItem(`math_game-games-played_${dif}`, +(localStorage.getItem(`math_game-games-played_${dif}`) || 0) + 1);
      generateMathGameItem();
    }
  }
})
// Open
const openMathGameBtn = allDashboardItem.querySelector('button.open-math-game-wrap');
openMathGameBtn.addEventListener('click', () => {
  closeAllWraps();
  mathGameWrap.classList.add('show');
  mathGameReloadUserInfo();

  history.pushState(null, null, '#mathGame');
})

const mathGameInfo = {
  lvl: null,
  correctAns: null
};

// Game window
const mathGameWindow = mathGameWrap.querySelector('div.game-window');
/* Close */ mathGameWindow.querySelector('button.close').addEventListener('click', () => {
  mathGameWindow.classList.remove('show');
  mathGameReloadUserInfo();
});

const mathGamePForShow = mathGameWindow.querySelector('p.for_show_math');
const mathGameAnswerInput = mathGameWindow.querySelector('input.answer-input');

const mathGameSendBtn = mathGameWindow.querySelector('button.send');
mathGameSendBtn.addEventListener('click', () => {
  const answer = mathGameAnswerInput.value.trim();
  if (!answer) return showResponseFn('Please enter your answer');

  mathGameAnswerInput.disabled = true;
  mathGameSendBtn.disabled = true;

  const corrAns = mathGameInfo.correctAns;
  if (corrAns == answer) {
    mathGamePForShow.textContent = 'CORRECT!';
    mathGamePForShow.style.color = 'green';
    localStorage.setItem(`math-game_correct-answers_${mathGameInfo.lvl}`, +(localStorage.getItem(`math-game_correct-answers_${mathGameInfo.lvl}`) || 0) + 1);
  } else {
    mathGamePForShow.textContent = `WRONG! CORRECT ANSWER:  ${corrAns}`;
    mathGamePForShow.style.color = 'red';
    localStorage.setItem(`math-game_incorrect-answers_${mathGameInfo.lvl}`, +(localStorage.getItem(`math-game_incorrect-answers_${mathGameInfo.lvl}`) || 0) + 1);
  }

  setTimeout(() => {
    mathGamePForShow.style.color = 'var(--text-color)';
    mathGameAnswerInput.value = '';
    mathGameAnswerInput.disabled = false;
    mathGameSendBtn.disabled = false;

    generateMathGameItem();
  }, 2500);
})

/* Reload user stats info */
const mathGameUserInfoCont = mathGameWrap.querySelector('div.info');
function mathGameReloadUserInfo() {
  // Games played
  const easyGamesPlayed = +localStorage.getItem('math_game-games-played_easy');
  const mediumGamesPlayed = +localStorage.getItem('math_game-games-played_medium');
  const hardGamesPlayed = +localStorage.getItem('math_game-games-played_hard');
  const expertGamesPlayed = +localStorage.getItem('math_game-games-played_expert');

  // Correct answers
  const correctAnsEasy = +localStorage.getItem('math-game_correct-answers_easy');
  const correctAnsMedium = +localStorage.getItem('math-game_correct-answers_medium');
  const correctAnsHard = +localStorage.getItem('math-game_correct-answers_hard');
  const correctAnsExpert = +localStorage.getItem('math-game_correct-answers_expert');
  const TOTAL_CORRECT = correctAnsEasy + correctAnsMedium + correctAnsHard + correctAnsExpert;

  // Incorrect answers
  const incorrectAnsEasy = +localStorage.getItem('math-game_incorrect-answers_easy');
  const incorrectAnsMedium = +localStorage.getItem('math-game_incorrect-answers_medium');
  const incorrectAnsHard = +localStorage.getItem('math-game_incorrect-answers_hard');
  const incorrectAnsExpert = +localStorage.getItem('math-game_incorrect-answers_expert');
  const TOTAL_INCORRECT = incorrectAnsEasy + incorrectAnsMedium + incorrectAnsHard + incorrectAnsExpert;

  mathGameUserInfoCont.innerHTML = `
<h3>Game info</h3>
<p>Total games played: <span>${easyGamesPlayed + mediumGamesPlayed + hardGamesPlayed + expertGamesPlayed}</span></p>
<p style='border: 2px solid green'>Total games played (easy): <span>${easyGamesPlayed}</span></p>
<p style='border: 2px solid rgb(100, 100, 0);'>Total games played (medium): <span>${mediumGamesPlayed}</span></p>
<p style='border: 2px solid orange'>Total games played (hard): <span>${hardGamesPlayed}</span></p>
<p style='border: 2px solid red'>Total games played (expert): <span>${expertGamesPlayed}</span></p>

<br>

<h3>Answers</h3>
<p>Total <span>correct</span> answers: <span>${TOTAL_CORRECT}</span></p>
<pre style='border: 2px solid green'>Total <span>correct</span> answers (easy): <span>${correctAnsEasy}</span>
<span>${+(correctAnsEasy * 100 / TOTAL_CORRECT).toFixed(2) || 0}%</span> of total <span>correct</span> answers
<span>${+(correctAnsEasy * 100 / ( correctAnsEasy + incorrectAnsEasy )).toFixed(2) || 0}%</span> <span>correct</span> answers</pre>

<pre style='border: 2px solid rgb(100, 100, 0);'>Total <span>correct</span> answers (medium): <span>${correctAnsMedium}</span>
<span>${+(correctAnsMedium * 100 / TOTAL_CORRECT).toFixed(2) || 0}%</span> of total <span>correct</span> answers
<span>${+(correctAnsMedium * 100 / ( correctAnsMedium + incorrectAnsMedium )).toFixed(2) || 0}%</span> <span>correct</span> answers</pre>

<pre style='border: 2px solid orange'>Total <span>correct</span> answers (hard): <span>${correctAnsHard}</span>
<span>${+(correctAnsHard * 100 / TOTAL_CORRECT).toFixed(2) || 0}%</span> of total <span>correct</span> answers
<span>${+(correctAnsHard * 100 / ( correctAnsHard + incorrectAnsHard )).toFixed(2) || 0}%</span> <span>correct</span> answers</pre>

<pre style='border: 2px solid red'>Total <span>correct</span> answers (expert): <span>${correctAnsExpert}</span>
<span>${+(correctAnsExpert * 100 / TOTAL_CORRECT).toFixed(2) || 0}%</span> of total <span>correct</span> answers
<span>${+(correctAnsExpert * 100 / ( correctAnsExpert + incorrectAnsExpert )).toFixed(2) || 0}%</span> <span>correct</span> answers</pre>

<br>

<p>Total <span>incorrect</span> answers: <span>${TOTAL_INCORRECT}</span></p>
<pre style='border: 2px solid green'>Total <span>incorrect</span> answers (easy): <span>${incorrectAnsEasy}</span>
<span>${+(incorrectAnsEasy * 100 / TOTAL_INCORRECT).toFixed(2) || 0}%</span> of total <span>incorrect</span> answers
<span>${+(incorrectAnsEasy * 100 / ( correctAnsEasy + incorrectAnsEasy )).toFixed(2) || 0}%</span> <span>incorrect</span> answers</pre>

<pre style='border: 2px solid rgb(100, 100, 0);'>Total <span>incorrect</span> answers (medium): <span>${incorrectAnsMedium}</span>
<span>${+(incorrectAnsMedium * 100 / TOTAL_INCORRECT).toFixed(2) || 0}%</span> of total <span>incorrect</span> answers
<span>${+(incorrectAnsMedium * 100 / ( correctAnsMedium + incorrectAnsMedium )).toFixed(2) || 0}%</span> <span>incorrect</span> answers</pre>

<pre style='border: 2px solid orange'>Total <span>incorrect</span> answers (hard): <span>${incorrectAnsHard}</span>
<span>${+(incorrectAnsHard * 100 / TOTAL_INCORRECT).toFixed(2) || 0}%</span> of total <span>incorrect</span> answers
<span>${+(incorrectAnsHard * 100 / ( correctAnsHard + incorrectAnsHard )).toFixed(2) || 0}%</span> <span>incorrect</span> answers</pre>

<pre style='border: 2px solid red'>Total <span>incorrect</span> answers (expert): <span>${incorrectAnsExpert}</span>
<span>${+(incorrectAnsExpert * 100 / TOTAL_INCORRECT).toFixed(2) || 0}%</span> of total <span>incorrect</span> answers
<span>${+(incorrectAnsExpert * 100 / ( correctAnsExpert + incorrectAnsExpert )).toFixed(2) || 0}%</span> <span>incorrect</span> answers</pre>
`.trim();
}

// Generate math item FUNCTION
function generateMathGameItem() {
  const actionsMap = {
    '+': '+', '-': '-',
    '*': '×', '/': '÷'
  }

  const lvl = mathGameInfo.lvl || 'easy';

  if (lvl === 'easy') {
    const actions = '-+';

    const act = actions[Math.floor(Math.random() * actions.length)];
    const num1 = Math.floor(Math.random() * 200 + 1);
    const num2 = Math.floor(Math.random() * 200 + 1);

    const math = `${num1} ${act} ${num2}`;
    mathGameInfo.correctAns = act === '-' ? num1 - num2 : num1 + num2;

    mathGamePForShow.textContent = math;
  }

  if (lvl === 'medium') {
    const act1 = '+-'[Math.floor(Math.random() * 2)];
    const act2 = '*/'[Math.floor(Math.random() * 2)];

    const num1 = Math.floor(Math.random() * (500 - 10 + 1) + 10);
    const num3 = Math.floor(Math.random() * (15 - 3 + 1) + 3);
    const helpNum = Math.floor(Math.random() * (15 - 3 + 1) + 3);
    const num2 = act2 === '/' ? num3 * helpNum : helpNum;

    mathGamePForShow.textContent = `${num1} ${actionsMap[act1]} ${num2} ${actionsMap[act2]} ${num3}`;
    mathGameInfo.correctAns = eval(`${num1} ${act1} ${num2} ${act2} ${num3}`);
  }

  if (lvl === 'hard') {
    const needBrackets = Math.random() < 0.5;

    if (needBrackets) { // num% of num .1 (num1 .2 num2) .3 num3.toFixed(2);
      let numPercent1 = Math.floor(Math.random() * (250 - 10 + 1) + 10);
      numPercent1 = numPercent1 - (numPercent1 % 5);

      let numPercent2 = Math.floor(Math.random() * (1500 - 50 + 1) + 50);
      numPercent2 = numPercent2 - (numPercent2 % 10);

      const percentResult = numPercent1 / 100 * numPercent2;

      const act1 = '+-'[Math.floor(Math.random() * 2)];
      const act2 = '*/'[Math.floor(Math.random() * 2)];
      const act3 = '+-'[Math.floor(Math.random() * 2)];

      const num2 = Math.floor(Math.random() * (25 - 6 + 1) + 6);
      const helpNum = Math.floor(Math.random() * (25 - 6 + 1) + 6);
      const num1 = act2 === '/' ? helpNum * num2 : helpNum;

      const num3 = +(Math.random() * (2500 - 300 + 1) + 300).toFixed(2);

      mathGamePForShow.textContent = `${numPercent1}% of ${numPercent2} ${act1} ( ${num1} ${actionsMap[act2]} ${num2} ) ${act3} ${num3}`;
      mathGameInfo.correctAns = eval(`${percentResult} ${act1} ( ${num1} ${act2} ${num2} ) ${act3} ${num3}`);
    }
    else { // num1 .1 num% of num .2 num2
      let numPercent1 = Math.floor(Math.random() * (250 - 10 + 1) + 10);
      numPercent1 = numPercent1 - (numPercent1 % 5);

      let numPercent2 = Math.floor(Math.random() * (250 - 50 + 1) + 50);
      numPercent2 = numPercent2 - (numPercent2 % 10);

      const percentResult = numPercent1 / 100 * numPercent2;

      const act1 = '*/'[Math.floor(Math.random() * 2)];
      const act2 = '+-'[Math.floor(Math.random() * 2)];

      const helpNum = Math.floor(Math.random() * (15 - 5 + 1) + 5);
      const num1 = act1 === '/' ? percentResult * helpNum : helpNum;
      const num2 = +(Math.random() * (2500 - 300 + 1) + 300).toFixed(2);

      mathGamePForShow.textContent = `${num1} ${actionsMap[act1]} ${numPercent1}% of ${numPercent2} ${act2} ${num2}`;
      mathGameInfo.correctAns = eval(`${num1} ${act1} ${percentResult} ${act2} ${num2}`);
    }
  }

  if (lvl === 'expert') {
    const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    const randomNumber = (min, max) => {
      const scale = [1, 10, 100][randomInt(0, 2)];
      return randomInt(min * scale, max * scale) / scale;
    };

    const makePercent = () => {
      const percent = randomInt(5, 100);
      const base = randomInt(100, 2000);
      const value = percent / 100 * base;

      return {
        display: `${percent}% of ${base}`,
        value
      };
    };

    const makeIntegerBlock = () => {
      const type = randomInt(0, 6);
      const a = randomInt(12, 75);
      const q = randomInt(2, 30);

      const makeBlock = (numbers, operators) => ({
        expression: `${numbers[0]} ${operators[0]} ${numbers[1]} ${operators[1]} ${numbers[2]}`,
        display: `${numbers[0]} ${actionsMap[operators[0]]} ${numbers[1]} ${actionsMap[operators[1]]} ${numbers[2]}`
      });

      switch (type) {
        case 0: return makeBlock([a, randomInt(12, 75), randomInt(12, 75)], ['+', '-']);
        case 1: return makeBlock([a, randomInt(12, 75), randomInt(12, 75)], ['-', '+']);
        case 2: return makeBlock([a, randomInt(12, 75), randomInt(12, 75)], ['*', '+']);
        case 3: return makeBlock([a, randomInt(12, 75), randomInt(12, 75)], ['+', '*']);
        case 4: {
          const divisor = randomInt(2, 20);
          const dividend = divisor * q;
          return makeBlock([dividend, divisor, randomInt(12, 75)], ['/', '+']);
        }
        case 5: {
          const divisor = randomInt(2, 20);
          const dividend = divisor * q;
          return makeBlock([a, dividend, divisor], ['+', '/']);
        }
        default: {
          const divisor = randomInt(2, 20);
          const multiplier = divisor * q;
          return makeBlock([randomInt(2, 20), multiplier, divisor], ['*', '/']);
        }
      }
    };

    const round2 = value =>
      Math.round(
        (value + Math.sign(value) * Number.EPSILON * Math.abs(value)) * 100
      ) / 100;

    const type = randomInt(1, 3);
    let displayExpression;
    let calculationExpression;

    if (type === 1) {
      // num% of num .1 (num1 .2 num2 .3 num3) .4 num4 .5 num5
      const percent = makePercent();
      const block = makeIntegerBlock();
      const num4 = randomInt(3, 10);
      const num5 = randomNumber(700, 6500);

      const act1 = '+-'[randomInt(0, 1)];
      const act4 = '+-'[randomInt(0, 1)];
      const act5 = '+-'[randomInt(0, 1)];

      const power = randomInt(2, 4);

      displayExpression = `${percent.display} ${actionsMap[act1]} ( ${block.display} ) ${actionsMap[act4]} ${num4}^${power} ${actionsMap[act5]} ${num5}`;
      calculationExpression = `${percent.value} ${act1} ( ${block.expression} ) ${act4} ${num4 ** power} ${act5} ${num5}`;
    } else if (type === 2) {
      // (num1 .1 num2 .2 num3) .3 num% of num .4 num4 .5 num5
      const block = makeIntegerBlock();
      const percent = makePercent();
      const num4 = randomNumber(700, 6500);
      const num5 = randomInt(3, 10);

      const act3 = '+-'[randomInt(0, 1)];
      const act4 = '+-'[randomInt(0, 1)];
      const act5 = '+-'[randomInt(0, 1)];

      const power = randomInt(2, 4);

      displayExpression = `( ${block.display} ) ${actionsMap[act3]} ${percent.display} ${actionsMap[act4]} ${num4} ${actionsMap[act5]} ${num5}^${power}`;
      calculationExpression = `( ${block.expression} ) ${act3} ${percent.value} ${act4} ${num4} ${act5} ${num5 ** power}`;
    } else {
      // num1 .1 (num2 .2 num% of num) .3 num% of num .4 num3
      const num1 = randomNumber(700, 6500);
      const num2 = randomInt(3, 10);
      const percent1 = makePercent();
      const percent2 = makePercent();
      const num3 = randomNumber(700, 6500);

      const act1 = '+-'[randomInt(0, 1)];
      const act2 = '+-'[randomInt(0, 1)];
      const act3 = '+-'[randomInt(0, 1)];
      const act4 = '+-'[randomInt(0, 1)];

      const power = randomInt(2, 4);

      displayExpression = `${num1} ${actionsMap[act1]} ( ${num2}^${power} ${actionsMap[act2]} ${percent1.display} ) ${actionsMap[act3]} ${percent2.display} ${actionsMap[act4]} ${num3}`;
      calculationExpression = `${num1} ${act1} ( ${num2 ** power} ${act2} ${percent1.value} ) ${act3} ${percent2.value} ${act4} ${num3}`;
    }

    mathGamePForShow.textContent = displayExpression;
    mathGameInfo.correctAns = round2(eval(calculationExpression));
  }
}