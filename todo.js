// Set preloader text
whatIsLoadingText.textContent = 'Loading task management...';

const todoWrap = document.querySelector('.todo-wrap');
// Open todo wrap
document.querySelector('.open-todo-wrap')
.addEventListener('click', () => {
  showPreloader();
  renderTodos();
  todoWrap.classList.add('show');
  showPreloader(false);
});
// Close todo wrap
todoWrap.querySelector('.close-todo-wrap')
.addEventListener('click', () => {
  todoWrap.classList.remove('show');
  todoWrap.classList.remove('is-edit');
  isEdit = false;
  initEditingBlock = null;
});
// Close hidden todo wrap
todoWrap.querySelector('.close-hidden-wind-btn')
.addEventListener('click', () => hiddenTodosWindow.classList.remove('show'));
// Toggle hidden todos wrap
todoWrap.querySelector('.toggle-hidden-todos-window')
.addEventListener('click', () => {
  showPreloader();
  hiddenTodosWindow.classList.toggle('show');
  renderHiddenTodos();
  showPreloader(false);
})

let allTodosObj = {};
let hiddenTodosObj = {};

function createTodoElement(txt, date, isCompleted = false) {
  const div = document.createElement('div');
  const h2 = document.createElement('h2');
  const p = document.createElement('p');
  const btnDelTodo = document.createElement('button');
  const btnEditTodo = document.createElement('button');
  const inputCompletedTodo = document.createElement('input');

  div.classList.add('todo-block');
  const savedTodoBg = allTodosObj[txt].color;
  if(savedTodoBg) {
    div.style.backgroundColor = savedTodoBg;
    div.style.color = isWhiteColor(savedTodoBg) ? 'black' : 'white';
  } else {
    div.style.background = 'var(--block-bg)';
    div.style.color = 'var(--text-color)';
  }

  if(allTodosObj[txt].mark) {
    div.classList.add('marked');
    div.setAttribute('data-mark', allTodosObj[txt].mark);
  }

  h2.classList.add('todo-h2');
  p.classList.add('todo-p');
  btnDelTodo.classList.add('del-todo-btn');
  inputCompletedTodo.classList.add('todo-input-completed');
  btnEditTodo.classList.add('edit-todo-btn');

  h2.textContent = txt;
  p.textContent = date;
  btnDelTodo.textContent = '❌';
  btnEditTodo.textContent = '✏️';

  inputCompletedTodo.setAttribute('type', 'checkbox')
  inputCompletedTodo.checked = isCompleted;

  inputCompletedTodo.title = 'Complete todo';
  btnDelTodo.title = 'Delete todo';
  btnEditTodo.title = 'Edit todo name';

  div.append(h2, p, btnDelTodo, btnEditTodo, inputCompletedTodo);
  todosContainer.appendChild(div);
}
function renderTodos() {
  let allTodosArr = Object.keys(allTodosObj);
  if(!allTodosArr.length) {
    todosNumberText.textContent = 'Todos: 0/50';
    todoProgress.value = 0;
    return todosContainer.innerHTML = '<h1>No todo...</h1>';
  };

  todosContainer.textContent = '';
  for(let key of allTodosArr) createTodoElement(key, allTodosObj[key].date, allTodosObj[key].isCompleted);

  const todosBlocksLng = Object.keys(allTodosObj).length + Object.keys(hiddenTodosObj).length;
  todoProgress.value = todosBlocksLng;
  todosNumberText.textContent = `Todos: ${todosBlocksLng}/50`;
}
function renderFilteredTodos(txt) {
  todosContainer.textContent = '';
  for(let todoName of Object.keys(allTodosObj)) {
    const infoObj = allTodosObj[todoName];
    if(
      todoName.toLowerCase().includes(txt)
      || infoObj.date.includes(txt)
      || infoObj.mark.toLowerCase().includes(txt)
    ) createTodoElement(v, infoObj.date, infoObj.isCompleted);
  }
  if(!todosContainer.children.length) todosContainer.innerHTML = `<h1>No todo found...</h1>`;
}

const todoTxtLength = todoWrap.querySelector('.todo-symbols-length');

const todosContainer = todoWrap.querySelector('.todos-container');

const todoNameInput = todoWrap.querySelector('.todo-name-input');
todoNameInput.addEventListener('input', () => todoTxtLength.textContent = `${todoNameInput.value.trim().length}/25`);
todoNameInput.addEventListener('focus', () => {
  todoTxtLength.textContent = '0/25';
  todoNameInput.value = '';
  editTodoBlock.classList.remove('show');
});
const todoAddBtn = todoWrap.querySelector('.add-todo');

const todosNumberText = todoWrap.querySelector('.todos-number');

// Search
const searchTodoInput = todoWrap.querySelector('.todo-search');
searchTodoInput.addEventListener('input', () => {
  const txt = searchTodoInput.value.trim().toLowerCase();

  if(!txt) return renderTodos();

  renderFilteredTodos(txt);
})
searchTodoInput.addEventListener('focus', () => {
  todoNameInput.value = '';
  todoMarkInput.value = '';
  todoTxtLength.textContent = '0/25';
  editTodoBlock.classList.remove('show');
})

// Hidden todos
const hiddenTodosWindow = todoWrap.querySelector('.hidden-todos-window'),
hiddenTodosContainer = hiddenTodosWindow.querySelector('.hidden-todos-container')

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
todoWrap.querySelector('.unhide-todos')
.addEventListener('click', () => {
  for(let h of Object.keys(hiddenTodosObj)) {
    allTodosObj[h] = hiddenTodosObj[h];
    delete hiddenTodosObj[h];
  }
  renderTodos();
  renderHiddenTodos();
  todoSaveBtn.classList.add('unsaved');
  isTodosUnsaved = true;
})

// Set todos color
function isWhiteColor(hex) {
  const rHex = hex.slice(1, 3), gHex = hex.slice(3, 5), bHex = hex.slice(5);
  const r = parseInt(rHex, 16);
  const g = parseInt(gHex, 16);
  const b = parseInt(bHex, 16);
  return 0.299 * r + 0.587 * g + 0.114 * b >= 140 ? true : false;
}

// Todo mark input
const todoMarkInput = todoWrap.querySelector('.todo-mark-input');
todoMarkInput.addEventListener('input', () => todoTxtLength.textContent = `${todoMarkInput.value.length}/12`)
todoMarkInput.addEventListener('focus', () => {
  todoTxtLength.textContent = '0/12';
  todoMarkInput.value = '';
  editTodoBlock.classList.remove('show');
});

// Edit todo
let initEditingBlock = null;

const editTodoBlock = todoWrap.querySelector('.edit-todo-block');
const editTodoBlockTitle = editTodoBlock.firstElementChild;
const editTodoColorInput = editTodoBlock.querySelector('.todo-bgc-input');
const editTodoMarkInput = editTodoBlock.querySelector('.edit-todo-mark');
const editTodoMarkInputLabel = editTodoBlock.querySelector('.edit-mark-label');
const editPreviewTodoMark = editTodoBlock.querySelector('.preview-todo-mark');

editTodoMarkInput.addEventListener('input', () => {
  editTodoMarkInputLabel.textContent = `${editTodoMarkInput.value.trim().length}/12`;
  editPreviewTodoMark.textContent = editTodoMarkInput.value;
});

// Reset todo color
editTodoBlock.querySelector('.reset-todo-color')
.addEventListener('click', () => {
  if(!confirm('Reset todo color?')) return;

  const todoName = initEditingBlock.firstElementChild.textContent;
  if(!allTodosObj[todoName].color) return showResponseFn("You don't have a todo color");

  delete allTodosObj[todoName].color;

  renderTodos();
  editTodoBlock.classList.remove('show');

  todoSaveBtn.classList.add('unsaved');
  isTodosUnsaved = true;
})

// Confirm color btn
editTodoBlock.querySelector('.confirm-todo-edit-color')
.addEventListener('click', () => {
  const colorVal = editTodoColorInput.value;
  const todoName = initEditingBlock.firstElementChild.textContent;

  if(allTodosObj[todoName].color === colorVal) return editTodoBlock.classList.remove('show');

  allTodosObj[todoName].color = colorVal;

  renderTodos();
  editTodoBlock.classList.remove('show');

  todoSaveBtn.classList.add('unsaved');
  isTodosUnsaved = true;
})

// Confirm mark btn
editTodoBlock.querySelector('.confirm-todo-edit-mark')
.addEventListener('click', () => {
  const markVal = editTodoMarkInput.value.trim();
  const todoName = initEditingBlock.firstElementChild.textContent;

  if(allTodosObj[todoName].mark === markVal) return editTodoBlock.classList.remove('show');

  if(markVal.length > 12) return showResponseFn('Todo mark is too long');

  allTodosObj[todoName].mark = markVal;

  renderTodos();
  editTodoBlock.classList.remove('show');

  todoSaveBtn.classList.add('unsaved');
  isTodosUnsaved = true;
})

/* Progress */ const todoProgress = todoWrap.querySelector('.todo-progress');

// Todo wrap click event
todoWrap.addEventListener('click', e => {
  if(!e.target.closest('.edit-todo-block')) editTodoBlock.classList.remove('show');
  if(e.target.closest('.add-todo')) { // Add todo btn
    if(Object.keys(allTodosObj).length + Object.keys(hiddenTodosObj).length >= 50) return showResponseFn('Your have todos limit');
    const val = todoNameInput.value.trim();
    if(!val) return;
    if(allTodosObj[val] || hiddenTodosObj[val]) return showResponseFn(`Todo name "${val}" is already used`);
    if(val.length > 25) return showResponseFn('Todo name is too long');

    const mark = todoMarkInput.value.trim();
    if(mark.length > 12) return showResponseFn('Todo mark is too long');

    todoMarkInput.value = '';
    todoNameInput.value = '';

    const d = new Date();
    const date = d.getDate(),
    month = d.getMonth(),
    year = d.getFullYear();
    const time = `${String(date).padStart(2, '0')}:${String(month + 1).padStart(2, '0')}:${year}`;

    todoNameInput.focus();

    allTodosObj[val] = { date: time, isCompleted: false, mark, }

    todoSaveBtn.classList.add('unsaved');
    isTodosUnsaved = true;

    renderTodos();
    todoTxtLength.textContent = '0/25';
  }
  else if(e.target.closest('.del-todo-btn')) { // Delete todo btn
    if(localStorage.getItem('conf-before-delete') === 'true') if(!confirm('Delete?')) return;

    delete allTodosObj[e.target.parentElement.firstElementChild.textContent]

    e.target.parentElement.style.transition = 'none';
    e.target.parentElement.lastElementChild.checked = false;

    if(localStorage.getItem('disabled-anim') === 'true') return renderTodos();

    e.target.parentElement.classList.add('del-anim');
    todoSaveBtn.classList.add('unsaved');
    isTodosUnsaved = true;

    setTimeout(renderTodos, delAnimTime);
  }
  else if(e.target.closest('.edit-todo-btn')) { // Open edit todo block
    const targetBlock = e.target.closest('.edit-todo-btn').parentElement;
    const todoName = targetBlock.firstElementChild.textContent;

    editTodoBlockTitle.textContent = todoName;
    initEditingBlock = targetBlock;
    editTodoMarkInput.value = allTodosObj[todoName].mark;
    editTodoMarkInputLabel.textContent = `${editTodoMarkInput.value.length}/12`;
    editPreviewTodoMark.textContent = editTodoMarkInput.value;

    editTodoBlock.classList.add('show');
  }
  else if(e.target.closest('.todo-input-completed')) { // Complete todo
    allTodosObj[e.target.parentElement.firstElementChild.textContent].isCompleted = e.target.checked;
    todoSaveBtn.classList.add('unsaved');
    isTodosUnsaved = true;
  }
  else if(e.target.closest('.todo-input')) { // Set todo name input
    searchTodoInput.value = '';
    renderTodos();
  }
  else if(e.target.closest('.hide-completed-todos')) { // Hide complete todos btn
    const arr = Object.keys(allTodosObj);
    if(!arr.length) return showResponseFn("Completed todos not found");
    for(let todo of arr) {
      if(allTodosObj[todo].isCompleted) {
        hiddenTodosObj[todo] = allTodosObj[todo];
        delete allTodosObj[todo]
      }
    }
    renderTodos();
    renderHiddenTodos();

    todoSaveBtn.classList.add('unsaved');
    isTodosUnsaved = true;
  }
})

// Set preloader value
preloaderProgress.value = 2;