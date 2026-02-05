const codeSnippetsBlocksInfo = {
'Class manipulation': `
element.classList.add('class') // Add class
element.classList.remove('class') // Remove class
element.classList.contains('class') // Element have a class?
element.classList.toggle('class') // Toggle class

if(element.classList.contains('first') && !element.classList.contains('second')) element.classList.add('yes');
else element.classList.remove('second');
`,

'Delegation': `
wrap.addEventListener('click', e => {
  if(e.target.tagName === 'BUTTON') console.log('Is button!');
  else if(e.target.classList.contains('copy-text')) console.log('Copy text!');
  else console.log('NO');
})`,

'Theme switcher': `
const themeSwitcherBtn = document.querySelector('[data-theme-switcher]');
themeSwitcherBtn.addEventListener('click', () => setTheme())
function setTheme() {
  const theme = localStorage.getItem('todo-theme');
  if(theme === 'dark') {
    localStorage.setItem('todo-theme', 'light');
    document.documentElement.classList.remove('dark-theme');
    themeSwitcherBtn.textContent = '☀️';
  }
  else {
    localStorage.setItem('todo-theme', 'dark');
    document.documentElement.classList.add('dark-theme');
    themeSwitcherBtn.textContent = '🌑';
  }
}
if(localStorage.getItem('todo-theme') === 'dark') {
  document.documentElement.classList.add('dark-theme');
  themeSwitcherBtn.textContent = '🌑';
} else themeSwitcherBtn.textContent = '☀️';
`,

'Confirm reload': `
window.addEventListener('beforeunload', e => {
  e.preventDefault();
  e.returnValue = '';
})
`,

'Keyboard events': `
/* Open wrap on keydown */
document.addEventListener('keydown', e => {
  if(e.ctrlKey && e.code === 'KeyO') wrap.classList.add('show');
  else if(e.code === 'KeyG') globalWrap.classList.add('show');
})
`,

'Classic fetch': `
async function renderContent() {
const data = await fetch('url').then(r => r.json());
console.log(data);
}
renderContent()
`,

'Create DOM elements': `
const div = document.createElement('div'),
  h2 = document.createElement('h2'),
  p = document.createElement('p'),
  btn = document.createElement('button');

div.classList.add('block');
h2.textContent = 'Text';
p.textContent = 'Text';
btn.textContent = 'Button';
div.append(h2, p, btn);
container.appendChild(div);
`,

'Toggle block on click': `
const btn = document.querySelector('.toggle-btn');
const block = document.querySelector('.block');

btn.addEventListener('click', () => {
  block.classList.toggle('show');
});
`,

'Modal open/close': `
const openBtn = document.querySelector('.open');
const closeBtn = document.querySelector('.close');
const modal = document.querySelector('.modal');

openBtn.addEventListener('click', () => modal.classList.add('show'));
closeBtn.addEventListener('click', () => modal.classList.remove('show'));
`,

'Clipboard copy': `
btn.addEventListener('click', () => {
  navigator.clipboard.writeText(text);
})
`,

'Preloader': `
const loader = document.querySelector('.preloader_wrap');
loader.classList.add('show');

setTimeout(() => {
  loader.classList.remove('show');
}, 1500);
`,

'Open + close all': `
const allWindows = document.querySelectorAll('.window');
const openWindow = document.querySelector('.open-window');

for(let win of allWindows) win.classList.remove('show');
openWindow.classList.add('show')
`,

'Auto resize element on input': `
const element = document.querySelector('.element');
element.addEventListener('input', () => {
  element.style.height = element.scrollHeight + 'px';
})
`,

'Scroll to top on click': `
const btn = document.querySelector('.btn');
btn.addEventListener('click', () => document.documentElement.scrollTop = 0);
`,

'Search logic': `
const allElementsObj = {};
// ...
const searchInput = document.querySelector('.search-input');
searchInput.addEventListener('input', () => {
  const value = searchInput.value;
  for(let element in allElementsObj) {
    if(allElementsObj[element].includes(value)) {
      console.log('Yes');
    }
  }
})
`,

'Password validate on submit': `
const form = document.querySelector('form');
const passwordInput = form.querySelector('.password-input');
form.addEventListener('submit', e => {
  e.preventDefault();
  const password = passwordInput.value;

  if(!/\d/.test(password) || !/[a-z]/i.test(password)) return;
  if(password.length < 8) return;

  else {
    console.log('Password is strong!');
  }
})
`,

'Debounce on input': `
let timer = null;

const input = document.querySelector('input')
input.addEventListener('input', () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    console.log('All on input logic');
    clearTimeout(timer);
  }, 250);
})
`,

'Classic localStorage helper': `
function localStorageHelper(localStorageName, operator, value) {
  if(operator === 'get') return JSON.parse(localStorage.getItem(localStorageName));
  else if(operator === 'set') localStorage.setItem(localStorageName, JSON.stringify(value));
  else if(operator === 'remove') localStorage.removeItem(localStorageName);
}
`,

'Fetch + Error Handling': `
async function fetchWithError(url) {
  try {
    const res = await fetch(url);
    if(!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch(e) {
    console.error('Fetch error:', e);
    return null;
  }
}
`,

'Random Hex Color Generator': `
function randomHexColor() {
  return '#' + Math.floor(Math.random()*16777215).toString(16);
}
`,

'Debounce for Async Functions': `
function debounceAsync(fn, delay) {
  let timer;
  return async function(...args) {
    clearTimeout(timer);
    return new Promise(resolve => {
      timer = setTimeout(async () => resolve(await fn(...args)), delay);
    });
  }
}
`,

'Detect Dark Mode Preference': `
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
document.documentElement.classList.toggle('dark-theme', prefersDark);
`,
};