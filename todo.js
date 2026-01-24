const todoWrap = document.querySelector('.todo-wrap');
document.querySelector('.open-todo-wrap')
.addEventListener('click', () => {
  showPreloader();
  renderTodos();
  todoWrap.classList.add('show');
  showPreloader(false);
});
document.querySelector('[data-close-todo-wrap]')
.addEventListener('click', () => {
  todoWrap.classList.remove('show');
  todoWrap.classList.remove('is-edit');
  isEdit = false;
  initialEditTodo = null;
  todoColorBlock.classList.remove('show');
});
document.querySelector('.close-hidden-wind-btn')
.addEventListener('click', () => hiddenTodosWindow.classList.remove('show'));
document.querySelector('.toggle-hidden-todos-window')
.addEventListener('click', () => {
  showPreloader();
  hiddenTodosWindow.classList.toggle('show');
  renderHiddenTodos();
  showPreloader(false);
})

function createTodoElement(txt, date, isCompleted = false) {
  const div = document.createElement('div');
  const h2 = document.createElement('h2');
  const p = document.createElement('p');
  const btnDelTodo = document.createElement('button');
  const btnReplaceTodo = document.createElement('button');
  const inputCompletedTodo = document.createElement('input');
  const replaceTodoInput = document.createElement('input');

  div.setAttribute('data-todo-block', '');
  const savedTodoBg = allTodosObj[txt].color;
  if(savedTodoBg) {
    div.style.backgroundColor = savedTodoBg;
    div.style.color = isWhiteColor(savedTodoBg) ? 'black' : 'white';
  } else {
    div.style.background = 'var(--block-bg)';
    div.style.color = 'var(--text-color)';
  }

  h2.setAttribute('data-todo-h2', '');
  p.setAttribute('data-todo-p', '');
  btnDelTodo.setAttribute('data-del-todo-btn', '');
  btnReplaceTodo.setAttribute('data-replace-todo-btn', '');
  inputCompletedTodo.setAttribute('data-todo-input-completed', '');
  replaceTodoInput.setAttribute('placeholder', 'Назва...');
  replaceTodoInput.setAttribute('data-replace-todo-input', '');
  replaceTodoInput.setAttribute('type', 'text');

  h2.textContent = txt;
  p.textContent = date;
  btnDelTodo.textContent = '❌';
  btnReplaceTodo.textContent = '✏️';

  inputCompletedTodo.setAttribute('type', 'checkbox')
  inputCompletedTodo.checked = isCompleted;

  inputCompletedTodo.title = 'Complete todo';
  btnDelTodo.title = 'Delete todo';
  btnReplaceTodo.title = 'Edit todo name';

  div.append(h2, p, btnDelTodo, btnReplaceTodo, replaceTodoInput, inputCompletedTodo);
  todosContainer.appendChild(div);
}

function renderTodos() {
  let allTodosArr = Object.keys(allTodosObj);
  if(!allTodosArr.length) {
    todosNumberText.textContent = 'Todos: 0';
    return todosContainer.innerHTML = '<h1>No todo...</h1>';
  };

  todosContainer.textContent = '';
  for(let key of allTodosArr) createTodoElement(key, allTodosObj[key].date, allTodosObj[key].isCompleted);

  todosNumberText.textContent = `Todos: ${allTodosArr.length}`;
}

function renderFilteredTodos(txt) {
  todosContainer.textContent = '';
  for(let v of Object.keys(allTodosObj)) {
    const infoObj = allTodosObj[v];
    if(v.toLowerCase().includes(txt) || infoObj.date.includes(txt)) { createTodoElement(v, infoObj.date, infoObj.isCompleted); }
  }
  if(!todosContainer.children.length) todosContainer.innerHTML = `<h1>No todo found...</h1>`;
}

const todoNameLengthTxt = document.querySelector('[todo-symbols-length]');

let allTodosObj = {};
let hiddenTodosObj = {};

const todosContainer = document.querySelector('[data-todos-container]');

const todoInput = document.querySelector('[data-todo-input]');
todoInput.addEventListener('input', () => todoNameLengthTxt.textContent = `${todoInput.value.trim().length} / 25`)
const todoAddBtn = document.querySelector('[data-add-todo]');

const todosNumberText = document.querySelector('[data-todos-number]');

const searchTodoInput = document.querySelector('[data-todo-search]');
searchTodoInput.addEventListener('input', e => {
  const txt = e.target.value.trim().toLowerCase();

  if(!txt) return renderTodos();

  renderFilteredTodos(txt);
})

// Hidden todos
const hiddenTodosContainer = document.querySelector('.hidden-todos-container'),
hiddenTodosWindow = document.querySelector('.hidden-todos-window');

function renderHiddenTodos() {
  hiddenTodosContainer.textContent = '';

  for(let key of Object.keys(hiddenTodosObj)) {
    const div = document.createElement('div'),
    h3 = document.createElement('h3'),
    delButton = document.createElement('button'),
    dateP = document.createElement('p');

    div.classList.add('hidden-todo-block');
    delButton.classList.add('delete-hidden-todo');

    h3.textContent = key;
    delButton.textContent = '❌';
    dateP.textContent = hiddenTodosObj[key].date;

    div.append(h3, delButton, dateP);
    hiddenTodosContainer.appendChild(div);
  }
  if(!hiddenTodosContainer.children.length) hiddenTodosContainer.innerHTML = '<h2>No hidden todos...</h2>'
}

hiddenTodosContainer.addEventListener('click', e => {
  if(e.target.classList.contains('delete-hidden-todo')) {
    if(localStorage.getItem('conf-before-delete') === 'true' && !confirm('Delete?')) return;
    delete hiddenTodosObj[e.target.parentElement.firstElementChild.textContent];
    todoSaveBtn.classList.add('unsaved');
    if(localStorage.getItem('disabled-anim') === 'true') {
      renderTodos();
      return renderHiddenTodos();
    };

    e.target.parentElement.classList.add('del-anim');

    setTimeout(() => {
      renderHiddenTodos();
      renderTodos();
    }, delAnimTime);
  }
})

// Unhide todos
document.querySelector('.unhide-todos')
.addEventListener('click', () => {
  for(let h of Object.keys(hiddenTodosObj)) {
    allTodosObj[h] = hiddenTodosObj[h];
    delete hiddenTodosObj[h];
  }
  renderTodos();
  renderHiddenTodos();
  todoSaveBtn.classList.add('unsaved');
})

// Set todos color
function isWhiteColor(hex) {
  const rHex = hex.slice(1, 3), gHex = hex.slice(3, 5), bHex = hex.slice(5);
  const r = parseInt(rHex, 16);
  const g = parseInt(gHex, 16);
  const b = parseInt(bHex, 16);
  return 0.299 * r + 0.587 * g + 0.114 * b >= 140 ? true : false;
}
let isEdit = false, initialEditTodo = null;

const todoColorBlock = document.querySelector('.set-todos-color-block');
const todoColorInput = todoColorBlock.querySelector('input');

// Confirm todo color btn
todoColorBlock.querySelector('.confirm-todo-color').addEventListener('click', () => {
  const hex = todoColorInput.value;
  const isWhiteHex = isWhiteColor(hex);
  initialEditTodo.style.background = hex;
  initialEditTodo.style.color = isWhiteHex ? '#000' : '#fff';
  allTodosObj[initialEditTodo.firstElementChild.textContent].color = hex;
  todoColorBlock.classList.remove('show');
  allTodosObj[initialEditTodo.firstElementChild.textContent].color = hex;

  todoSaveBtn.classList.add('unsaved');
})
// Reset todo color btn
todoColorBlock.querySelector('.reset-todo-color').addEventListener('click', () => {
  if(!confirm('Reset todo color?')) return;

  delete allTodosObj[initialEditTodo.firstElementChild.textContent].color;
  renderTodos();
  showResponseFn(`Reset todo(${initialEditTodo.firstElementChild.textContent}) color`);
  todoColorBlock.classList.remove('show');
})

// Todo wrap click event
todoWrap.addEventListener('click', e => {
  const closestEditTodo = isEdit ? e.target.closest('[data-todo-block]') : null;
  if(closestEditTodo) { // Open todo color editor
    todoColorBlock.classList.add('show');
    initialEditTodo = closestEditTodo;
    const targetTodoObj = initialEditTodo.getBoundingClientRect();
    const todoColorBlockObj = todoColorBlock.getBoundingClientRect();

    todoColorBlock.style.right = `${Math.max( 0, targetTodoObj.right - targetTodoObj.width - todoColorBlockObj.width )}px`;
    todoColorBlock.style.top = `${Math.max( todoWrap.scrollTop, targetTodoObj.top - todoColorBlockObj.height + todoWrap.scrollTop + targetTodoObj.height / 2 )}px`;
  }
  else if(e.target.classList.contains('start-edit-todos')) { // Start edit btn
    isEdit = !isEdit;
    todoWrap.classList.toggle('is-edit');
    showResponseFn(isEdit ? 'Edit mode on' : 'Edit mode off');
    todoColorBlock.classList.remove('show');
  }
  else if(e.target.closest('[data-add-todo]')) { // Add todo btn
    const val = todoInput.value.trim();
    if(!val) return;
    if(allTodosObj[val] || hiddenTodosObj[val]) return showResponseFn(`Todo name "${val}" is already used`);
    if(val.length > 25) return showResponseFn('Todo name is too long');

    const d = new Date();
    const date = d.getDate(),
    month = d.getMonth(),
    year = d.getFullYear();
    const time = `${String(date).padStart(2, '0')}:${String(month + 1).padStart(2, '0')}:${year}`;

    todoInput.value = '';

    todoInput.focus();

    allTodosObj[val] = { date: time, isCompleted: false, }
    todoSaveBtn.classList.add('unsaved');
    renderTodos();
  }
  else if(e.target.closest('[data-del-todo-btn]')) { // Delete todo btn
    if(localStorage.getItem('conf-before-delete') === 'true') if(!confirm('Delete?')) return;

    delete allTodosObj[e.target.parentElement.firstElementChild.textContent]

    e.target.parentElement.style.transition = 'none';
    e.target.parentElement.lastElementChild.checked = false;

    if(localStorage.getItem('disabled-anim') === 'true') return renderTodos();

    e.target.parentElement.classList.add('del-anim');
    todoSaveBtn.classList.add('unsaved');
    setTimeout(renderTodos, delAnimTime);
  }
  else if(e.target.closest('[data-replace-todo-btn]') && e.target.classList.contains('rename-todo')) { // Rename todo
    const block = e.target.parentElement;
    const replaceTodoInput = block.querySelector('[data-replace-todo-input]');
    const newName = replaceTodoInput.value;
    const oldName = block.firstElementChild.textContent;

    e.target.classList.remove('rename-todo');
    replaceTodoInput.classList.remove('show');
    e.target.textContent = '✏️';

    if(!newName.trim()) return;
    if(allTodosObj[newName] || hiddenTodosObj[newName]) return showResponseFn(`Todo name "${newName}" is already used`);
    if(newName.length > 25) return showResponseFn('Todo name is too long');

    delete allTodosObj[oldName];

    const d = new Date();
    const date = d.getDate(),
    month = d.getMonth(),
    year = d.getFullYear();
    const time = `${String(date).padStart(2, '0')}:${String(month + 1).padStart(2, '0')}:${year}`;

    allTodosObj[newName] = { date: time, isCompleted: block.lastElementChild.checked }
    todoSaveBtn.classList.add('unsaved');

    renderTodos();
  }
  else if(e.target.closest('[data-replace-todo-btn]')) { // Open rename todo input
    const replaceTodoInput = e.target.parentElement.querySelector('[data-replace-todo-input]');

    e.target.classList.add('rename-todo');
    replaceTodoInput.classList.add('show');
    e.target.textContent = '✅';

    replaceTodoInput.focus();
  }
  else if(e.target.closest('[data-todo-input-completed]')) { // Complete todo
    allTodosObj[e.target.parentElement.firstElementChild.textContent].isCompleted = e.target.checked;
    todoSaveBtn.classList.add('unsaved');
  }

  else if(e.target.closest('[data-todo-input]')) { // Set todo name input
    searchTodoInput.value = '';
    renderTodos();
  }
  else if(e.target.closest('.hide-completed-todos')) { // Hide complete todos btn
    for(let todo of Object.keys(allTodosObj)) {
      if(allTodosObj[todo].isCompleted) {
      hiddenTodosObj[todo] = allTodosObj[todo];
      delete allTodosObj[todo]
    }}
  renderTodos();
  renderHiddenTodos();
  todoSaveBtn.classList.add('unsaved');
  }
})