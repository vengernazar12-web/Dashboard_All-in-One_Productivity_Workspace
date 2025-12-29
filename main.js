let userObj = {};

document.addEventListener('keydown', e => {
  if(e.key === '<' || e.key === '>') e.preventDefault();
  if(e.key === 'Enter') {
    if(todoWrap.classList.contains('show')) todoAddBtn.click();
    else if(calculatorWrap.classList.contains('show')) {
      allCalcBtnsObj['='].click();
      allCalcBtnsObj['='].classList.add('btn-active');
    }
    else if(saveUrlsWrap.classList.contains('show')) saveUrlBtn.click();
  }
  else if(e.key === 'Escape') {
    todoWrap.classList.remove('show');
    notesWrap.classList.remove('show');
    calculatorWrap.classList.remove('show');
    saveUrlsWrap.classList.remove('show');
  }
  else if(calculatorWrap.classList.contains('show')) {
    let button = e.key;
    if(button === 'Backspace') {
      delCalcSymbolBtn.click();
      return delCalcSymbolBtn.classList.add('btn-active');
    };
    if(button === '=') button = '+';
    if(allCalcBtnsObj[button]) {
      allCalcBtnsObj[button].click();
      allCalcBtnsObj[button].classList.add('btn-active');
    };
  }
})
document.addEventListener('keyup', () => {
  if(calculatorWrap.classList.contains('show')) {
    allNavBtns.forEach(v => v.classList.remove('btn-active'));
    delCalcSymbolBtn.classList.remove('btn-active');
  }
})

const allStatsWrap = document.querySelector('.all-stats-wrap');
const todosNumberStats = allStatsWrap.querySelector('.todos-number-stats');
const notesSymbolsNumber = allStatsWrap.querySelector('.notes-symbols-number');
const savedUrlsNumber = allStatsWrap.querySelector('.saved-urls-number');
// All stats
document.querySelector('.show-all-dashboard-stats')
.addEventListener('click', () => {
  renderTodos();
  todosNumberStats.textContent = `Todos ${todosContainer.children.length}`;

  notesSymbolsNumber.textContent = `Notes SYMBOLs ${textBlock.textContent.replace(/\n/g, '').length}`;

  renderAllUrls();
  savedUrlsNumber.textContent = `Saved URLs ${allUrlsContainer.children.length}`;

  allStatsWrap.classList.toggle('show');
})

document.querySelectorAll('.min-wrap').forEach(b => {b.addEventListener('click', () => {
  b.parentElement.removeAttribute('style');
  b.parentElement.classList.toggle('minimized');
})})

/* Theme switcher */
const todoSwitchTheme = document.querySelector('[data-theme-switcher]');
todoSwitchTheme.addEventListener('click', () => setTodoTheme())
function setTodoTheme() {
  const theme = localStorage.getItem('todo-theme');
  if(theme === 'dark') {
    localStorage.setItem('todo-theme', 'light');
    document.documentElement.classList.remove('dark-theme');
    todoSwitchTheme.textContent = '☀️';
  }
  else {
    localStorage.setItem('todo-theme', 'dark');
    document.documentElement.classList.add('dark-theme');
    todoSwitchTheme.textContent = '🌑';
  }
}

if(localStorage.getItem('todo-theme') === 'dark') {
  document.documentElement.classList.add('dark-theme');
  todoSwitchTheme.textContent = '🌑';
}
else todoSwitchTheme.textContent = '☀️';

/* All opened btns */
document.querySelector('.open-todo-wrap')
.addEventListener('click', () => { renderTodos(); todoWrap.classList.add('show')});

document.querySelector('.open-notes-wrap')
.addEventListener('click', () => {
  reloadNotes();
  notesWrap.classList.add('show');
  notesLimitNumber.textContent = `${textBlock.textContent.replace(/\n/g, '').length}/2500`;
})

document.querySelector('.open-calc-wrap')
.addEventListener('click', () => {
  calculatorWrap.classList.add('show');
  allCalcBtnsObj['='].click();
});

document.querySelector('.open-save-urls-wrap')
.addEventListener('click', () => { renderAllUrls(); saveUrlsWrap.classList.add('show')});

/* All closed btns */
document.querySelector('[data-close-todo-wrap]')
.addEventListener('click', () => todoWrap.classList.remove('show'));

document.querySelector('[data-close-notes-wrap]')
.addEventListener('click', () => {
  notesWrap.classList.remove('show');
  reloadNotes();
});

document.querySelector('.close-calc-wrap')
.addEventListener('click', () => calculatorWrap.classList.remove('show'));

document.querySelector('.close-save-urls-wrap')
.addEventListener('click', () => saveUrlsWrap.classList.remove('show'))

// Drag and drop window
let isDrag = false,
dragBlock = null,
x, y;
document.addEventListener('pointerup', () => {isDrag = false; dragBlock = null;})

document.addEventListener('pointerdown', e => {
  if(!e.target.parentElement.classList.contains('minimized') || e.target.tagName !== 'HEADER') return;
  isDrag = true;
  dragBlock = e.target.parentElement;
  const blockObj = dragBlock.getBoundingClientRect();
  x = e.clientX - blockObj.left;
  y = e.clientY - blockObj.top;
})

document.addEventListener('pointermove', e => {
  if(!isDrag || !dragBlock) return;
  let left = e.clientX - x,
  top = e.clientY - y;

  left = Math.max(0, left);
  top = Math.max(0, top);

  const bObj = dragBlock.getBoundingClientRect();

  dragBlock.style.left = Math.min(left, window.innerWidth - bObj.width) + 'px';
  dragBlock.style.top = Math.min(top, window.innerHeight - bObj.height) + 'px';
})

// Server
const signInWind = document.querySelector('.sign-in-window');

function showSignInWindow() {
  const sesObj = JSON.parse(sessionStorage.getItem('user-obj'));
  if(sesObj) {
    userObj = sesObj;
    return reloadContent();
  }
  if(localStorage.getItem('user-account')) {
    const name = localStorage.getItem('user-account');

    fetch('https://695054688531714d9bd055c4.mockapi.io/dashboard/user_content')
    .then(resp => resp.json())
    .then(resp => {
      userObj = resp.find(obj => obj.userName === name);
      if(!userObj) {
        userObj = { userName: name, content: { todos: {}, urls: {}, notes: '', } };
        showResponseFn('Сталась помилка при загрузці данних')
      };
      sessionStorage.setItem('user-obj', JSON.stringify(userObj));
      return reloadContent();
    })
  }
  else signInWind.classList.add('show-wind');
}
document.addEventListener('DOMContentLoaded', () => showSignInWindow());

const showResponseText = document.querySelector('.show-response');
const hashPassword = password => btoa(password);

function showResponseFn(text) {
  showResponseText.classList.remove('show');
  void showResponseText.offsetWidth;
  showResponseText.textContent = text;
  showResponseText.classList.add('show');
}

// All save btns
const allSaveBtns = document.querySelectorAll('.--saved-btn');
allSaveBtns.forEach(btn => btn.addEventListener('click', () => {
  if(textBlock.textContent.replace(/\n/g, '').length > 2500) return showResponseFn('У вас занабто багато символів в NOTES');
  userObj.content.todos = allTodosObj;
  userObj.content.urls = allUrlsObj;
  userObj.content.notes = textBlock.innerHTML;
  fetch(`https://695054688531714d9bd055c4.mockapi.io/dashboard/user_content/${userObj.id}`, {
    method: 'PUT',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userObj),
  })
  .then(response => {
    if(response.ok) showResponseFn('Успішно збережено!');
    else showResponseFn('Щось пішло не так :(')
  })
  .catch(() => { showResponseFn('Error !') })

  allSaveBtns.forEach(b => b.disabled = true);
  setTimeout(() => { allSaveBtns.forEach(b => b.disabled = false) }, 150000);
  console.log(userObj)
}))

// Sign-in container btns/inputs
const nameInput = document.querySelector('.user-name-input'),
passwordInput = document.querySelector('.user-password-input'),
signInForm = document.querySelector('.sign-in-container'),

showSignInError = document.querySelector('.show-sign-in-error');

signInForm.addEventListener('submit', e => {
  e.preventDefault();

  const name = nameInput.value.trim(); let pass = passwordInput.value.trim();
  if(!/[a-z]/.test(pass) || !/[A-Z]/.test(pass) || !/\d/.test(pass)) {
    return showSignInError.textContent =
    'Ваш пароль повинен містити принаймні 1 велику, 1 маленьку літери та цифри'
  }
  pass = hashPassword(pass);
  let allUsInfo = fetch('https://695054688531714d9bd055c4.mockapi.io/dashboard/Userinfo')
  .then(response => response.json());

  allUsInfo.then(response => {
    if(response.find(obj => obj.userName === name && obj.userPassword === pass)) {
      fetch('https://695054688531714d9bd055c4.mockapi.io/dashboard/user_content')
      .then(resp => resp.json())
      .then(resp => {
        const findObj = resp.find(obj => obj.userName === name);
        if(findObj) {
          userObj = findObj;
          signInWind.classList.remove('show-wind');
          localStorage.setItem('user-account', name);
          reloadContent()
          return showResponseFn('Вітаємо !');
        }
        else return showResponseText.textContent = "Сталась помилка !";
      })
    }
    else {
      allUsInfo.then(resp => {
        if(resp.find(obj => obj.userName === name)) {return showResponseText.textContent = "Ім'я зайняте або пароль не правильний !";}
        showResponseText.textContent = 'Почекайте, іде загрузка...';
        fetch('https://695054688531714d9bd055c4.mockapi.io/dashboard/Userinfo', {
          method: 'POST',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userName: name, userPassword: pass }),
        })
        .then(resp => {
          if(resp.ok) {
            fetch('https://695054688531714d9bd055c4.mockapi.io/dashboard/user_content', {
              method: 'POST',
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userName: name, content: { todos: {}, urls: {}, notes: '', } })
            })
            .then(resp => resp.json())
            .then(resp => {
              userObj = resp;
              localStorage.setItem('user-account', name);
              reloadContent();
              signInWind.classList.remove('show-wind');
              showResponseFn('Вітаємо !');
            });
          }
          else { showResponseText.textContent = 'Сталась помилка...'; return showResponseFn('Сталась помилка !')}
        })
      })
    }
  })
})

function reloadContent() {
  allTodosObj = userObj.content.todos;
  allTodosArr = Object.keys(allTodosObj);
  allUrlsObj = userObj.content.urls;
  allUrlsArr = Object.keys(allUrlsObj);
  textBlock.innerHTML = userObj.content.notes;

  showResponseFn('Успішно загружені данні');
}