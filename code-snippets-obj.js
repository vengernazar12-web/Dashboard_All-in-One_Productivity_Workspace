const codeSnippetsBlocksInfo = {
'Class manipulation': `
element.classList.add('class') // Add class
element.classList.remove('class') // Remove class
element.classList.contains('class') // Element have a class?
element.classList.toggle('class') // Toggle class

if(element.classList.contains('first') && !element.classList.contains('second')) element.classList.add('yes');
else element.classList.remove('second');`,

'Delegation': `
wrap.addEventListener('click', e => {
  if(e.target.tagElement === 'BUTTON') console.log('Is button!');
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
} else themeSwitcherBtn.textContent = '☀️';`,

'Confirm reload': `
window.addEventListener('beforeunload', e => {
  e.preventDefault();
  e.returnValue = '';
})`,

'Key... events': `
/* Open wrap on keydown */
document.addEventListener('keydown', e => {
  if(e.ctrlKey && e.code === 'KeyO') wrap.classList.add('show');
  else if(e.code === 'KeyG) globalWrap.classList.add('show');
})`,

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
})`,

'Preloader': `
const loader = document.querySelector('.preloader_wrap');
loader.classList.add('show');

setTimeout(() => {
  loader.classList.remove('show');
}, 1500);
`,
};