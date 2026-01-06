const FAKE_SERVER_URL = 'https://695054688531714d9bd055c4.mockapi.io/dashboard/';

let userObj = {};
const mls = +localStorage.getItem('del-anim-time');
let delAnimTime = mls !== null ? mls : 1500;
document.documentElement.style.setProperty('--del-animation-time', `${delAnimTime / 1000}s`);

document.addEventListener('keydown', e => {
  if(e.key === '<' || e.key === '>' || e.key === '&' || e.key === '/') e.preventDefault();
  if(notesWrap.classList.contains('show') && e.ctrlKey && e.code === 'KeyH') {
    e.preventDefault();
    openAddNoteForm.click();
  }

  else if(e.key === 'Enter') {
    if(todoWrap.classList.contains('show')) todoAddBtn.click();
    else if(calculatorWrap.classList.contains('show')) {
      allCalcBtnsObj['='].click();
      allCalcBtnsObj['='].classList.add('btn-active');
    }
    else if(saveUrlsWrap.classList.contains('show')) addUrlBtn.click();
    else if(addNotesForm.classList.contains('show')) addNotesButton.click();
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

  notesSymbolsNumber.textContent = `Notes SYMBOLs ${''}`;

  renderAllUrls();
  savedUrlsNumber.textContent = `Saved URLs ${allUrlsContainer.children.length}`;

  allStatsWrap.classList.toggle('show');
})

document.querySelectorAll('.min-wrap').forEach(b => {
  b.addEventListener('click', () => {
  b.parentElement.removeAttribute('style');
  b.parentElement.classList.toggle('minimized');
})})

/* Theme switcher */
const DashboardSwitchTheme = document.querySelector('[data-theme-switcher]');
DashboardSwitchTheme.addEventListener('click', () => setDashboardTheme())
function setDashboardTheme() {
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
else DashboardSwitchTheme.textContent = '☀️';

// Settings
const settingsWindow = document.querySelector('.settings-window'),
animationTimeSelect = document.querySelector('.animation-time-select');
document.querySelector('.open-settings-window')
.addEventListener('click', () => {
  if(localStorage.getItem('del-anim-time') !== null) {
    const val = +localStorage.getItem('del-anim-time') / 1000;
    animationTimeSelect.value = `${val}s`;
  };
  if(localStorage.getItem('disabled-anim') === 'true') disAnimBtn.textContent = '✔️';
  else disAnimBtn.textContent = '✖️';
  if(localStorage.getItem('conf-before-delete') === 'true') confBefDelBtn.textContent = '✔️';
  else confBefDelBtn.textContent = '✖️';
  settingsWindow.classList.add('show');
});

animationTimeSelect.addEventListener('change', e => {
  const msNum = parseFloat(e.target.value) * 1000;
  delAnimTime = msNum;
  localStorage.setItem('del-anim-time', msNum);
  document.documentElement.style.setProperty('--del-animation-time', `${delAnimTime / 1000}s`);
})

document.querySelector('.notes-font-size-sett')
.addEventListener('input', e => {
  const number = e.target.value;
  if(!e.target.value || !number) return localStorage.setItem('notes-font-size', 1.2);
  localStorage.setItem('notes-font-size', number);
})

if(localStorage.getItem('disabled-anim') === 'true') document.documentElement.style.setProperty('--is-comp-anim-transition', 'none');
const disAnimBtn = document.querySelector('.disabled-animation-sett');
disAnimBtn.addEventListener('click', e => {
  const isDis = localStorage.getItem('disabled-anim') === 'true';
  if(isDis) {
    e.target.textContent = '✖️';
    document.documentElement.style.setProperty('--is-comp-anim-transition', 'box-shadow 1s')
  }
  else {
    e.target.textContent = '✔️';
    document.documentElement.style.setProperty('--is-comp-anim-transition', 'none');
  };
  localStorage.setItem('disabled-anim', !isDis);
})

// Conf before delete
const confBefDelBtn = document.querySelector('.conf-before-del-sett');
confBefDelBtn.addEventListener('click', e => {
  const isConfirm = localStorage.getItem('conf-before-delete') === 'true';
  if(isConfirm) e.target.textContent = '✖️';
  else e.target.textContent = '✔️';
  localStorage.setItem('conf-before-delete', !isConfirm);
})

/* All OPEN btns */
document.querySelector('.open-todo-wrap')
.addEventListener('click', () => {
  renderTodos();
  todoWrap.classList.add('show');
});

document.querySelector('.open-calc-wrap')
.addEventListener('click', () => {
  calculatorWrap.classList.add('show');
  allCalcBtnsObj['='].click();
});

document.querySelector('.open-save-urls-wrap')
.addEventListener('click', () => {
  renderAllUrls();
  saveUrlsWrap.classList.add('show');
});

// Toggle hidden todos window
document.querySelector('.toggle-hidden-todos-window')
.addEventListener('click', () => {
  hiddenTodosWindow.classList.toggle('show');
  renderHiddenTodos();
})

// Open notes wrap
document.querySelector('.open-notes-wrap')
.addEventListener('click', () => {
  notesWrap.classList.add('show');
  if(allUserNotesCont.children.length >= 5) openAddNoteForm.style.display = 'none';
})

/* All CLOSE btns */
document.querySelector('[data-close-todo-wrap]')
.addEventListener('click', () => todoWrap.classList.remove('show'));

document.querySelector('.close-calc-wrap')
.addEventListener('click', () => calculatorWrap.classList.remove('show'));

document.querySelector('.close-add-urls-wrap')
.addEventListener('click', () => saveUrlsWrap.classList.remove('show'))

// Close settings
document.querySelector('.close-settings-window')
.addEventListener('click', () => settingsWindow.classList.remove('show'));

// Close hidden todos window
document.querySelector('.close-hidden-wind-btn')
.addEventListener('click', () => hiddenTodosWindow.classList.remove('show'))

// Close notes wrap
document.querySelector('.close-notes-wrap')
.addEventListener('click', () => notesWrap.classList.remove('show'))

document.querySelector('.close-notes-content-wrap')
.addEventListener('click', e => {
  const name = notesContentTitle.textContent;
  allNotesObj[name].txt = userNotesText.innerText;
  showResponseFn(`Save "${name}" note text`);
  unsavedMarks(false);
  notesContentWrap.classList.remove('show');
});

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
const allWrapBtns = document.querySelectorAll('.--opened-btn');
function showSignInWindow() {
  allWrapBtns.forEach(v => v.disabled = true);
  const sesObj = JSON.parse(sessionStorage.getItem('user-obj'));
  if(sesObj) {
    userObj = sesObj;
    reloadContent();
    allWrapBtns.forEach(v => v.disabled = false);
    return;
  }
  if(localStorage.getItem('user-account')) {
    const name = localStorage.getItem('user-account');

    fetch(`${FAKE_SERVER_URL}user_content`)
    .then(resp => resp.json())
    .then(resp => {
      userObj = resp.find(obj => obj.userName === name);
      if(!userObj) {
        userObj = {
          userName: name,
          content: { todos: {}, urls: {}, notes: {}, }, hiddenTodos: {} };
        showResponseFn('Failed loading data');
        localStorage.removeItem('user-account');
        allWrapBtns.forEach(v => v.disabled = false);
        return signInWind.classList.add('show-wind');
      };
      sessionStorage.setItem('user-obj', JSON.stringify(userObj));
      reloadContent();
      allWrapBtns.forEach(v => v.disabled = false);
      return;
    })
  }
  else {
    signInWind.classList.add('show-wind');
    allWrapBtns.forEach(v => v.disabled = false);
    return;
  }
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
  allSaveBtns.forEach(b => b.disabled = true);
  showResponseFn('Please wait...');

  const heightNoteLng = Object.keys(allNotesObj).find(v => allNotesObj[v].txt.replaceAll('\n', '').length > 1000);
  if(heightNoteLng) {
    showResponseFn(`Note "${heightNoteLng}" is too long...`);
    return allSaveBtns.forEach(b => b.disabled = false);
  }

  userObj.content.todos = allTodosObj;
  userObj.content.urls = allUrlsObj;
  userObj.content.hiddenTodos = hiddenTodosObj;
  userObj.content.notes = allNotesObj;
  fetch(`${FAKE_SERVER_URL}user_content/${userObj.id}`, {
    method: 'PUT',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userObj),
  })
  .then(response => {
    if(response.ok) {
      showResponseFn('Saved your data!');
      sessionStorage.setItem('user-obj', JSON.stringify(userObj))}
    else {
      showResponseFn("Failed to save data :(");
      sessionStorage.setItem('user-obj', JSON.stringify(userObj))
      allSaveBtns.forEach(b => b.disabled = false)
      return unsavedMarks(false);
    }
  })
  .catch(() => {
    sessionStorage.setItem('user-obj', JSON.stringify(userObj));
    showResponseFn('Error !');
    setTimeout(() => showResponseFn('You must be online to avoid losing your todos/notes/URLs'), 2500);
    allSaveBtns.forEach(b => b.disabled = false);
    return unsavedMarks(false);
  })

  setTimeout(() => { allSaveBtns.forEach(b => b.disabled = false) }, 150000);
  unsavedMarks(true);
}))

window.addEventListener('beforeunload', e => {
  if([...allSaveBtns].find(btn => btn.classList.contains('unsaved'))) {
    e.preventDefault();
    e.returnValue = '';
  }
})

// Sign-in container btns/inputs
const nameInput = document.querySelector('.user-name-input'),
passwordInput = document.querySelector('.user-password-input'),
signInForm = document.querySelector('.sign-in-container'),
showSignInError = document.querySelector('.show-sign-in-error'),
signInBtn = document.querySelector('.sign-in-btn');

signInForm.addEventListener('submit', e => {
  e.preventDefault();
  signInBtn.disabled = true;

  const name = nameInput.value.trim(); let pass = passwordInput.value.trim();
  if(!/[a-z]/.test(pass) || !/[A-Z]/.test(pass) || !/\d/.test(pass)) {
    signInBtn.disabled = false;
    return showSignInError.textContent = 'Ваш пароль повинен містити принаймні 1 велику, 1 маленьку літери та цифри'
  }
  pass = hashPassword(pass);
  let allUsInfo = fetch(`${FAKE_SERVER_URL}Userinfo`)
  .then(response => response.json());

  allUsInfo.then(response => {
    if(response.find(obj => obj.userName === name && obj.userPassword === pass)) {
      fetch(`${FAKE_SERVER_URL}user_content`)
      .then(resp => resp.json())
      .then(resp => {
        const findObj = resp.find(obj => obj.userName === name);
        if(findObj) {
          userObj = findObj;
          signInWind.classList.remove('show-wind');
          localStorage.setItem('user-account', name);
          reloadContent()
          signInBtn.disabled = false;
          return showResponseFn('Welcome !');
        }
        else { signInBtn.disabled = false; return showResponseText.textContent = "Error !"};
      })
    }
    else {
      allUsInfo.then(resp => {
        if(resp.find(obj => obj.userName === name)) {
          showResponseText.textContent = "Ім'я зайняте або пароль не правильний !";
          return signInBtn.disabled = false;
        }
        showResponseText.textContent = 'Loading...';
        fetch(`${FAKE_SERVER_URL}Userinfo`, {
          method: 'POST',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userName: name, userPassword: pass }),
        })
        .then(resp => {
          if(resp.ok) {
            fetch(`${FAKE_SERVER_URL}user_content`, {
              method: 'POST',
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userName: name, content: { todos: {}, urls: {}, notes: {}, hiddenTodos: {} } })
            })
            .then(resp => resp.json())
            .then(resp => {
              userObj = resp;
              localStorage.setItem('user-account', name);
              reloadContent();
              signInWind.classList.remove('show-wind');
              signInBtn.disabled = false;
              showResponseFn('Welcome !');
            });
          }
          else { showResponseText.textContent = 'Error...'; return showResponseFn('Error !')}
        })
      })
    }
  })
})

function reloadContent() {
  allTodosObj = userObj.content.todos;
  allUrlsObj = userObj.content.urls;
  allUrlsArr = Object.keys(allUrlsObj);
  hiddenTodosObj = userObj.content.hiddenTodos;

  // Notes
  allNotesObj = userObj.content.notes;
  Object.keys(allNotesObj).forEach(note => generateNoteBlock( note, allNotesObj[note].description ))

  showResponseFn('Data been loaded');
}

// Unsaved btns mark
function unsavedMarks(isSave) {
  if(isSave) {
    allSaveBtns.forEach(v => {
      v.classList.remove('unsaved');
      v.setAttribute('title', '')
    });
  }
  else {
    allSaveBtns.forEach(v => {
      v.disabled = false;
      v.classList.add('unsaved');
      v.setAttribute('title', 'unsaved content')
    });
  }
}