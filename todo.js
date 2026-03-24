// Set preloader text
whatIsLoadingText.textContent = 'Loading task management...';

const todoWrap = document.querySelector('.todo-wrap');
// Open todo wrap
const openTodoWrapBtn = allDashboardItem.querySelector('.open-todo-wrap');
openTodoWrapBtn.addEventListener('click', () => {
  closeAllWraps();
  showPreloader();
  renderTodos();
  todoWrap.classList.add('show');
  showPreloader(false);
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

function initGroupsTodosObj() {
  groupedTodos = {};
  const allTags = new Set(Object.keys(allTodosObj).map(n => allTodosObj[n].tag));

  for(let t of allTags) {
    const allTodoInTag = [];
    for(let n in allTodosObj) if(allTodosObj[n].tag === t) allTodoInTag.push(n);
    groupedTodos[t] = allTodoInTag;
  }
}

let allTodosObj = {};
let hiddenTodosObj = {};
let groupedTodos = null;

// Add todo form
const addTodoForm = todoWrap.querySelector('.add-todo-form');
const toggleAddTodoForm = todoWrap.querySelector('.toggle-add-todo-form');
toggleAddTodoForm.addEventListener('click', () => addTodoForm.classList.toggle('show'));
// Close add todo form
addTodoForm.querySelector('.close-add-todo-form-btn')
.addEventListener('click', () => addTodoForm.classList.remove('show'));

function createTodoTagBlock(name) {
  const div = document.createElement('div'),
    h3 = document.createElement('h3'),
    cont = document.createElement('div');

  div.classList.add('todo-tag-block');
  h3.textContent = name;

  div.append(h3, document.createElement('hr'), cont);
  return div;
}

function createTodoElement(name, searchVal, isFavorite) {
  let markRegexp = !searchVal ? null : new RegExp(hashHtmlSymbols(searchVal), 'ig');

  const div = document.createElement('div'),
    h2 = document.createElement('h2'),
    p = document.createElement('p'),
    btnDelTodo = document.createElement('button'),
    btnEditTodo = document.createElement('button'),
    inputCompletedTodo = document.createElement('input'),
    mark = document.createElement('span'),
    favBtn = document.createElement('button');

  div.dataset.name = name;

  // Is custom color
  const savedTodoBg = allTodosObj[name].color;
  if(savedTodoBg) {
    div.style.backgroundColor = savedTodoBg;
    div.style.color = isWhiteColor(savedTodoBg) ? 'black' : 'white';
  } else {
    div.style.background = 'var(--block-bg)';
    div.style.color = 'var(--text-color)';
  }

  // Set class
  div.classList.add('todo-block');
  h2.classList.add('todo-h2');
  p.classList.add('todo-p');
  btnDelTodo.classList.add('del-todo-btn');
  inputCompletedTodo.classList.add('todo-input-completed');
  btnEditTodo.classList.add('edit-todo-btn');

  // Set attribute
  inputCompletedTodo.setAttribute('type', 'checkbox')
  inputCompletedTodo.checked = allTodosObj[name].isCompleted;

  // Set title attribute
  inputCompletedTodo.title = 'Complete todo';
  btnDelTodo.title = 'Delete todo';
  btnEditTodo.title = 'Edit todo name';

  // Set text
  btnDelTodo.innerHTML = '<svg><use href="#delete-code"></use></svg>';
  btnEditTodo.innerHTML = '<svg><use href="#edit"></use></svg>';

  if(!searchVal) h2.textContent = name;
  else h2.innerHTML = hashHtmlSymbols(name).replace(markRegexp, '<mark>$&</mark>');

  if(!searchVal) p.textContent = allTodosObj[name].date;
  else p.innerHTML = allTodosObj[name].date.replace(markRegexp, '<mark>$&</mark>');

  favBtn.innerHTML = '<svg><use href="#favorite-icon"></use></svg>';
  favBtn.classList.add('fav-todo-btn');
  favBtn.style.color = isFavorite ? 'yellow' : 'var(--text-color)';

  // Append
  div.append(h2, p, btnDelTodo, btnEditTodo, favBtn, inputCompletedTodo);

  // Set mark text and append mark
  if(allTodosObj[name].mark) {
    if(!searchVal) mark.textContent = allTodosObj[name].mark;
    else mark.innerHTML = hashHtmlSymbols(allTodosObj[name].mark).replace(markRegexp, '<mark>$&</mark>');

    mark.classList.add('todo-mark');
    div.appendChild(mark);
  };

  return div;
}

function renderTodos() {
  initGroupsTodosObj();
  searchTodoInput.value = '';

  todosContainer.textContent = '';
  const frag = document.createDocumentFragment();

  for(let tag in groupedTodos) {
    const tagBlock = createTodoTagBlock(tag);

    // Render favorites
    for(let n of groupedTodos[tag]) {
      if(allTodosObj[n].isFav) tagBlock.lastElementChild.appendChild(createTodoElement(n, null, true));
    }
    // Render not favorites
    for(let n of groupedTodos[tag]) {
      if(!allTodosObj[n].isFav) tagBlock.lastElementChild.appendChild(createTodoElement(n, null, false));
    }
    frag.appendChild(tagBlock);
  }
  todosContainer.appendChild(frag);

  const todosBlocksLng = Object.keys(allTodosObj).length + Object.keys(hiddenTodosObj).length;
  todoProgress.value = todosBlocksLng;
  todosNumberText.textContent = `Todos: ${todosBlocksLng}/${allBlockLimitsObj.todos}`;
}

const todoTxtLength = addTodoForm.querySelector('.todo-symbols-length');

const todosContainer = todoWrap.querySelector('.todos-container');

const todoNameInput = addTodoForm.querySelector('.todo-name-input');
todoNameInput.addEventListener('input', () => {
  todoTxtLength.textContent = `${todoNameInput.value.trim().length}/25`;
  renderShowFieldsBlock(Object.keys(allTodosObj), todoNameInput.value.trim(), todoNameInput, true);
});
todoNameInput.addEventListener('focus', () => {
  lastFocusedInput = todoNameInput;
  todoTxtLength.textContent = `${todoNameInput.value.trim().length}/25`;
  editTodoBlock.classList.remove('show');
});

const todoTagInput = addTodoForm.querySelector('.todo-tag-input');
todoTagInput.addEventListener('focus', () => {
  lastFocusedInput = todoTagInput
  todoTxtLength.textContent = `${todoTagInput.value.trim().length}/25`;
  editTodoBlock.classList.remove('show');
});
todoTagInput.addEventListener('input', () => {
  todoTxtLength.textContent = `${todoTagInput.value.trim().length}/25`
  renderShowFieldsBlock(Object.keys(allTodosObj).map(n => allTodosObj[n].tag), todoTagInput.value.trim(), todoTagInput);
});

const todoMarkInput = addTodoForm.querySelector('.todo-mark-input');
todoMarkInput.addEventListener('input', () => {
  todoTxtLength.textContent = `${todoMarkInput.value.length}/12`;
  renderShowFieldsBlock(Object.keys(allTodosObj).map(n => allTodosObj[n].mark), todoMarkInput.value.trim(), todoMarkInput);
})
todoMarkInput.addEventListener('focus', () => {
  lastFocusedInput = todoMarkInput;
  todoTxtLength.textContent = `${todoMarkInput.value.trim().length}/12`;
  editTodoBlock.classList.remove('show');
});

const todoAddBtn = addTodoForm.querySelector('.add-todo');

const todosNumberText = todoWrap.querySelector('.todos-number');

// Search
const searchTodoInput = todoWrap.querySelector('.todo-search');
searchTodoInput.addEventListener('input', () => {
  const txt = searchTodoInput.value.trim().toLowerCase();
  const safeTxt = txt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if(!txt) return renderTodos();

  todosContainer.textContent = '';
  const frag = document.createDocumentFragment();

  // Render favorite todos
  for(let todoName in allTodosObj) {
    const infoObj = allTodosObj[todoName];
    if(
      infoObj.isFav && (
         todoName.toLowerCase().includes(txt)
      || infoObj.date.includes(txt)
      || infoObj.mark.toLowerCase().includes(txt)
    )
    ) frag.appendChild(createTodoElement(todoName, safeTxt, true));
  }
  // Render no favorite todos
  for(let todoName in allTodosObj) {
    const infoObj = allTodosObj[todoName];
    if(
      !infoObj.isFav && (
         todoName.toLowerCase().includes(txt)
      || infoObj.date.includes(txt)
      || infoObj.mark.toLowerCase().includes(txt)
    )
    ) frag.appendChild(createTodoElement(todoName, safeTxt, false));
  }
  // Append fragment
  todosContainer.appendChild(frag);

  if(!todosContainer.childElementCount) todosContainer.innerHTML = `<h1>No todo found...</h1>`;
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
    const todoName = e.target.parentElement.firstElementChild.textContent;
    delete hiddenTodosObj[todoName];

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

  // Save change for userActions
  writeToUserActions(`Користувач видалив туду з назвою ${todoName}`);
})

// Unhide todos
hiddenTodosWindow.querySelector('.unhide-todos')
.addEventListener('click', () => {
  for(let h of Object.keys(hiddenTodosObj)) {
    allTodosObj[h] = hiddenTodosObj[h];
    delete hiddenTodosObj[h];
  }
  renderTodos();
  renderHiddenTodos();
  todoSaveBtn.classList.add('unsaved');

  // Save change for userActions
  writeToUserActions('Користувач забрав всі сховані(архівовані) туду назад в список туду');
})

// Set todos color
function isWhiteColor(hex) {
  const rHex = hex.slice(1, 3), gHex = hex.slice(3, 5), bHex = hex.slice(5);
  const r = parseInt(rHex, 16);
  const g = parseInt(gHex, 16);
  const b = parseInt(bHex, 16);
  return 0.299 * r + 0.587 * g + 0.114 * b >= 140 ? true : false;
}

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

  renderShowFieldsBlock(Object.keys(allTodosObj).map(n => allTodosObj[n].mark), editTodoMarkInput.value.trim(), editTodoMarkInput);
});

// Reset todo color
editTodoBlock.querySelector('.reset-todo-color')
.addEventListener('click', () => {
  if(!confirm('Reset todo color?')) return;

  const todoName = initEditingBlock.firstElementChild.textContent;
  if(!allTodosObj[todoName].color) return showResponseFn("You don't have a todo color");

  initUndoActionBlock('todos', allTodosObj);

  delete allTodosObj[todoName].color;

  renderTodos();
  editTodoBlock.classList.remove('show');

  todoSaveBtn.classList.add('unsaved');

  // Save change for userActions
    writeToUserActions(`Видалено кастомний колір для туду з назвою ${todoName}`);
})

// Confirm color btn
editTodoBlock.querySelector('.confirm-todo-edit-color')
.addEventListener('click', () => {
  const colorVal = editTodoColorInput.value;
  const todoName = initEditingBlock.firstElementChild.textContent;

  if(allTodosObj[todoName].color === colorVal) return editTodoBlock.classList.remove('show');

  initUndoActionBlock('todos', allTodosObj);

  allTodosObj[todoName].color = colorVal;

  renderTodos();
  editTodoBlock.classList.remove('show');

  todoSaveBtn.classList.add('unsaved');

  // Save change for userActions
    writeToUserActions(`Змінено колір для туду з назвою ${todoName}`);
})

// Confirm mark btn
editTodoBlock.querySelector('.confirm-todo-edit-mark')
.addEventListener('click', () => {
  const markVal = editTodoMarkInput.value.trim();
  const todoName = initEditingBlock.firstElementChild.textContent;
  const oldMark = allTodosObj[todoName].mark;

  if(oldMark === markVal) return editTodoBlock.classList.remove('show');

  if(markVal.length > 12) return showResponseFn('Todo mark is too long');

  initUndoActionBlock('todos', allTodosObj);

  allTodosObj[todoName].mark = markVal;

  renderTodos();
  editTodoBlock.classList.remove('show');

  todoSaveBtn.classList.add('unsaved');

  // Save change for userActions
    writeToUserActions(`Змінено марк для туду з назвою ${todoName} з ${oldMark} на ${markVal}`);
})

// Todo progresses
const progressesBlock = todoWrap.querySelector('.todo-progresses-block');
const completedTodoProg = progressesBlock.firstElementChild;
const notCompletedTodoProg = progressesBlock.lastElementChild;

// Toggle progresses block
todoWrap.querySelector('.toggle-todo-progresses-block')
.addEventListener('click', () => {
  progressesBlock.classList.toggle('open');

  if(progressesBlock.classList.contains('open')) {
    const todosLng = Object.keys(allTodosObj).length;
    completedTodoProg.max = todosLng;
    notCompletedTodoProg.max = todosLng;

    let comp = 0, notComp = 0;
    for(let n in allTodosObj) {
      if(allTodosObj[n].isCompleted) comp++;
      else notComp++;
    }

    completedTodoProg.value = comp;
    notCompletedTodoProg.value = notComp;
  }
})

/* Progress */ const todoProgress = todoWrap.querySelector('.todo-progress');

// Todo wrap click event
let delTodoTimer = null;
todoWrap.addEventListener('click', e => {
  if(!e.target.closest('.edit-todo-block')) editTodoBlock.classList.remove('show');
  if(!e.target.classList.contains('toggle-todo-progresses-block') && !e.target.closest('.todo-progresses-block')) progressesBlock.classList.remove('open');

  if(e.target.classList.contains('add-todo')) { // Add todo btn
    if(Object.keys(allTodosObj).length + Object.keys(hiddenTodosObj).length >= allBlockLimitsObj.todos) return showResponseFn('Your have todos limit');
    const val = todoNameInput.value.trim();
    if(!val) return;
    if(allTodosObj[val] || hiddenTodosObj[val]) return showResponseFn(`Todo name "${val}" is already used`);
    if(val.length > 25) return showResponseFn('Todo name is too long');

    const mark = todoMarkInput.value.trim();
    if(mark.length > 12) return showResponseFn('Todo mark is too long');

    const tag = todoTagInput.value.trim().toLowerCase();
    if(!tag) {
      todoTagInput.focus();
      return showResponseFn("Please set todo tag");
    }
    if(tag.length > 25) return showResponseFn('Todo tag is too long');

    todoMarkInput.value = '';
    todoNameInput.value = '';
    todoTagInput.value = '';

    const d = new Date();
    const date = d.getDate(),
    month = d.getMonth(),
    year = d.getFullYear();
    const time = `${String(date).padStart(2, '0')}:${String(month + 1).padStart(2, '0')}:${year}`;

    todoNameInput.focus();

    initUndoActionBlock('todos', allTodosObj);

    allTodosObj[val] = { date: time, isCompleted: false, mark, tag, }

    todoSaveBtn.classList.add('unsaved');

    renderTodos();
    todoTxtLength.textContent = '0/25';
    addTodoForm.classList.remove('show');

    // Save change for userActions
    writeToUserActions(`Додано нову туду з назвою: ${val}, з тегом: ${tag}${mark ? ' та марком: ' + mark : ''}`);
  }
  else if(e.target.closest('.del-todo-btn')) { // Delete todo btn
    if(localStorage.getItem('conf-before-delete') === 'true') if(!confirm('Delete?')) return;

    const todoBlock = e.target.closest('.del-todo-btn').parentElement;
    const todoName = todoBlock.firstElementChild.textContent;

    initUndoActionBlock('todos', allTodosObj);

    delete allTodosObj[todoName]

    todoBlock.style.transition = 'none';
    todoBlock.lastElementChild.checked = false;

    todoSaveBtn.classList.add('unsaved');

    if(localStorage.getItem('disabled-anim') === 'true') return renderTodos();

    todoBlock.classList.add('del-anim');
    clearTimeout(delTodoTimer);
    delTodoTimer = setTimeout(renderTodos, delAnimTime);

    // Save change for userActions
    writeToUserActions(`Видалено туду з назвою ${todoName}`);
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
  else if(e.target.classList.contains('todo-input-completed')) { // Complete todo
    const name = e.target.parentElement.firstElementChild.textContent;
    allTodosObj[name].isCompleted = e.target.checked;
    todoSaveBtn.classList.add('unsaved');

    // Save change for userActions
    writeToUserActions(`Позначено туду з назвою ${name} як ${allTodosObj[name].isCompleted ? 'виконана' : 'не виконана'}`);
  }
  else if(e.target.classList.contains('hide-completed-todos')) { // Hide complete todos btn
    const arr = Object.keys(allTodosObj);
    if(!arr.length) return showResponseFn("Todos not found");
    for(let todo of arr) {
      if(allTodosObj[todo].isCompleted) {
        hiddenTodosObj[todo] = allTodosObj[todo];
        delete allTodosObj[todo]
      }
    }
    renderTodos();
    renderHiddenTodos();
    todoSaveBtn.classList.add('unsaved');

    // Save change for userActions
    writeToUserActions('Записано всі виконані туду в сховані(архів)');
  }
  else if(e.target.closest('.fav-todo-btn')) { // Set todo favorite
    const todoName = e.target.closest('.fav-todo-btn').parentElement.firstElementChild.textContent;

    allTodosObj[todoName].isFav = !allTodosObj[todoName].isFav;
    todoSaveBtn.classList.add('unsaved');

    renderTodos();

    // Save change for userActions
    writeToUserActions(allTodosObj[todoName].isFav ? `Позначено туду з назвою ${todoName} як фаворит` : `Забрано з фаворитів туду з назвою ${todoName}`);
  }
})

// Set preloader value
preloaderProgress.value = 2;