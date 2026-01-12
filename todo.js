const todoWrap = document.querySelector('.todo-wrap');
function createTodoElement(txt, date, isCompleted = false) {
  if(!txt) return;
  const div = document.createElement('div');
  const h2 = document.createElement('h2');
  const p = document.createElement('p');
  const btnDelTodo = document.createElement('button');
  const btnReplaceTodo = document.createElement('button');
  const inputCompletedTodo = document.createElement('input');
  const replaceTodoInput = document.createElement('input');

  div.setAttribute('data-todo-block', '');
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

  inputCompletedTodo.title = 'Відмітити todo як готовий';
  btnDelTodo.title = 'Видалити todo';
  btnReplaceTodo.title = 'Змінити todo'

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

  allTodosArr.forEach(key => createTodoElement(key, allTodosObj[key].date, allTodosObj[key].isCompleted))

  todosNumberText.textContent = `Todos: ${allTodosArr.length}`;
}

function renderFilteredTodos(txt) {
  todosContainer.textContent = '';
  Object.keys(allTodosObj).forEach(v => {
    const infoObj = allTodosObj[v];

    if(v.toLowerCase().includes(txt) || infoObj.date.includes(txt)) {
      createTodoElement(v, infoObj.date, infoObj.isCompleted)
    }
  })
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

todoWrap.addEventListener('click', e => {
  if(e.target.closest('[data-add-todo]')) {
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
  else if(e.target.closest('[data-del-todo-btn]')) {
    if(localStorage.getItem('conf-before-delete') === 'true') if(!confirm('Delete?')) return;

    delete allTodosObj[e.target.parentElement.firstElementChild.textContent]

    e.target.parentElement.style.transition = 'none';
    e.target.parentElement.lastElementChild.checked = false;

    if(localStorage.getItem('disabled-anim') === 'true') return renderTodos();

    e.target.parentElement.classList.add('del-anim');
    todoSaveBtn.classList.add('unsaved');
    setTimeout(renderTodos, delAnimTime);
  }
  else if(e.target.closest('[data-replace-todo-btn]') && e.target.classList.contains('rename-todo')) {
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
  else if(e.target.closest('[data-replace-todo-btn]')) {
    const replaceTodoInput = e.target.parentElement.querySelector('[data-replace-todo-input]');

    e.target.classList.add('rename-todo');
    replaceTodoInput.classList.add('show');
    e.target.textContent = '✅';

    replaceTodoInput.focus();
  }
  else if(e.target.closest('[data-todo-input-completed]')) {
    allTodosObj[e.target.parentElement.firstElementChild.textContent].isCompleted = e.target.checked;
    todoSaveBtn.classList.add('unsaved');
  }

  else if(e.target.closest('[data-todo-input]')) {
    searchTodoInput.value = '';
    renderTodos();
  }
  else if(e.target.closest('.hide-completed-todos')) {
    Object.keys(allTodosObj).forEach(todo => {
    if(allTodosObj[todo].isCompleted) {
      hiddenTodosObj[todo] = allTodosObj[todo];
      delete allTodosObj[todo]
    }
  })
  renderTodos();
  renderHiddenTodos();
  todoSaveBtn.classList.add('unsaved');
  }
})

// Hidden todos
const hiddenTodosContainer = document.querySelector('.hidden-todos-container'),
hiddenTodosWindow = document.querySelector('.hidden-todos-window');

function renderHiddenTodos() {
  hiddenTodosContainer.textContent = '';

  Object.keys(hiddenTodosObj).forEach(key => {
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
  })
  if(!hiddenTodosContainer.children.length) hiddenTodosContainer.innerHTML = '<h2>No hidden todos...</h2>'
}

hiddenTodosContainer.addEventListener('click', e => {
  if(e.target.classList.contains('delete-hidden-todo')) {
    if(localStorage.getItem('conf-before-delete') === 'true') if(!confirm('Delete?')) return;
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
  Object.keys(hiddenTodosObj).forEach(h => {
    allTodosObj[h] = hiddenTodosObj[h];
    delete hiddenTodosObj[h];
  })
  renderTodos();
  renderHiddenTodos();
})