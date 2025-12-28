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
  if(!allTodosArr.length) { todosNumberText.textContent = 'Всього todo: 0'; return todosContainer.innerHTML = '<h1>Немає todo...</h1>'};

  todosContainer.textContent = '';

  allTodosArr.forEach(key => createTodoElement(key, allTodosObj[key].date, allTodosObj[key].isCompleted))

  todosNumberText.textContent = `Всього todo: ${allTodosArr.length}`;
}

function renderFilteredTodos(txt) {
  todosContainer.textContent = '';
  allTodosArr.forEach(v => {
    const infoObj = allTodosObj[v];

    if(v.toLowerCase().includes(txt) || infoObj.date.includes(txt)) {
      createTodoElement(v, infoObj.date, infoObj.isCompleted)
    }
  })
  if(!todosContainer.children.length) todosContainer.innerHTML = `<h1>Нічого не знайдено...</h1>`;
}

const todoNameLengthTxt = document.querySelector('[todo-symbols-length]');

let allTodosObj = null;
let allTodosArr = null;

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

const btnSortTodos = document.querySelector('[data-sort-todos]');
btnSortTodos.addEventListener('click', () => {
  const obj = {};
  allTodosArr.forEach(v => { if(!allTodosObj[v].isCompleted) obj[v] = allTodosObj[v]; })
  allTodosArr.forEach(v => { if(!obj[v]) obj[v] = allTodosObj[v]; })

  allTodosObj = obj;
  allTodosArr = Object.keys(allTodosObj);

  renderTodos();
})

todoWrap.addEventListener('click', e => {
  if(e.target.closest('[data-add-todo]')) {
    const val = todoInput.value.trim();
    if(!val) return;
    if(allTodosObj[val]) return alert('У вас уже є такий todo');
    if(val.length > 25) return alert('дуже велика назва, зменште її');

    const d = new Date();
    const date = d.getDate(),
    month = d.getMonth(),
    year = d.getFullYear();
    const time = `${String(date).padStart(2, '0')}:${String(month + 1).padStart(2, '0')}:${year}`;

    todoInput.value = '';

    todoInput.focus();

    allTodosObj[val] = { date: time, isCompleted: false, }
    allTodosArr = Object.keys(allTodosObj);

    renderTodos();
  }
  else if(e.target.closest('[data-del-todo-btn]')) {
    delete allTodosObj[e.target.parentElement.firstElementChild.textContent]
    allTodosArr = Object.keys(allTodosObj);

    e.target.parentElement.style.transition = 'none';
    e.target.parentElement.lastElementChild.checked = false;
    e.target.parentElement.classList.add('del-anim')

    setTimeout(() => {
      renderTodos();
      if(!allTodosArr.length) todosContainer.innerHTML = '<h1>Немає todo...</h1>';
    }, 1500);
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
    if(allTodosObj[newName]) return alert('У вас уже є такий todo');
    if(newName.length > 25) return alert('дуже велика назва, зменште її')

    delete allTodosObj[oldName];

    const d = new Date();
    const date = d.getDate(),
    month = d.getMonth(),
    year = d.getFullYear();
    const time = `${String(date).padStart(2, '0')}:${String(month + 1).padStart(2, '0')}:${year}`;

    allTodosObj[newName] = { date: time, isCompleted: block.lastElementChild.checked }
    allTodosArr = Object.keys(allTodosObj);

    renderTodos();
  }
  else if(e.target.closest('[data-replace-todo-btn]')) {
    const replaceTodoInput = e.target.parentElement.querySelector('[data-replace-todo-input]');

    e.target.classList.add('rename-todo');
    replaceTodoInput.classList.add('show');
    e.target.textContent = '✅';

    replaceTodoInput.focus();
  }
  else if(e.target.closest('[data-todo-input-completed]')) { allTodosObj[e.target.parentElement.firstElementChild.textContent].isCompleted = e.target.checked; }

  else if(e.target.closest('[data-todo-input]')) {
    searchTodoInput.value = '';
    renderTodos();
  }
})