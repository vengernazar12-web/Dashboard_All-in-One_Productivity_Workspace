const client = supabase.createClient(
  'https://ivzrhxvrwafrofotkmrv.supabase.co',
  'sb_publishable_gaf3l7-dqfddZGEZjBbatA_-AjzhiZ-'
);

const signWindow = document.querySelector('.sign-window');

const signUpForm = document.querySelector('.sign-up-form');
const signInForm = document.querySelector('.sign-in-form');

const signUpBtn = signUpForm.querySelector('.sign-up-btn');
const signInBtn = signInForm.querySelector('.sign-in-btn');

async function signFn(type) {
  const email = type === 'up' ? signUpForm['user-email'].value : signInForm['user-email'].value;
  const password = type === 'up' ? signUpForm['user-password'].value : signInForm['user-password'].value;

  try {
    if(type === 'up') {
      const {error} = await client.auth.signUp({email, password});
      if(error) return showResponseFn(error.message);
      showResponseFn('Check your email address and use sign-in form');
    }
    else {
      const {data, error} = await client.auth.signInWithPassword({email, password});
      if(error) return showResponseFn(error.message);
      if(!data.user.email_confirmed_at) return showResponseFn(`You must confirm your email address! Check you email address: ${data.user.email}`);

      const {data: contentFetchData, error: contentFetchError} = await client
      .from('user_content')
      .select('id, content')
      .eq('id', data.session.user.id)
      .single();

      if(contentFetchError && contentFetchError.code !== 'PGRST116') return showResponseFn('Something went wrong');
      showResponseFn('Welcome!');
      signWindow.classList.remove('show');
      reloadAllContent();
    }
  } catch(e) { showResponseFn('Error!') };
}

async function reloadAllContent() {
  let initialContent = await client.auth.getSession();
  if(!initialContent.data.session) return signWindow.classList.add('show');
  const id = initialContent.data.session.user.id;
  initialContent = await client.from('user_content').select('*').eq('id', id).single();
  if(initialContent) {
    const content = initialContent.data.content;
    allTodosObj = content.todos || {};
    hiddenTodosObj = content.hiddenTodos || {};
    allNotesObj = content.notes || {};
    allUrlsObj = content.urls || {};
    allUserCodesObj = content.codes || {};
    showPreloader(false);
    return showResponseFn('Your content been loaded');
  }
  else { showPreloader(false); signWindow.classList.add('show'); };
}

signUpForm.addEventListener('submit', e => {e.preventDefault(); signFn('up')});

signInForm.addEventListener('submit', e => {e.preventDefault(); signFn('in')});

// Save todos content
const todoSaveBtn = document.querySelector('.todo-save-btn');
todoSaveBtn.addEventListener('click', async () => {
  todoSaveBtn.disabled = true;
  showPreloader();
  showResponseFn('Please wait...');

  const {data, error} = await client.auth.getSession();
  if(error) {
    showPreloader(false);
    return showResponseFn(error.message);
  };

  if(!data.session) {
    signWindow.classList.add('show');
    showPreloader(false);
    return showResponseFn("Please sign in");
  }

  const id = data.session.user.id;
  const {data: initialContent, error: initialError} = await client.from('user_content').select('content').eq('id', id).single();
  if(initialError) {
    showPreloader(false);
    setTimeout(() => {todoSaveBtn.disabled = false}, 150000);
    return showResponseFn("Something went wrong");
  }
  initialContent.content.todos = allTodosObj;
  initialContent.content.hiddenTodos = hiddenTodosObj;

  const {error: tableError} = await client.from('user_content').update({content: initialContent.content}).eq('id', id);
  if(tableError) {
    showPreloader(false);
    setTimeout(() => todoSaveBtn.disabled = false, 15000);
    return showResponseFn("Your todos haven't been saved, pease try again later...");
  }

  todoSaveBtn.classList.remove('unsaved');

  setTimeout(() => todoSaveBtn.disabled = false, 15000);
  showResponseFn('Your todos have been saved');
  showPreloader(false);
})

// Save notes content
const noteSaveBtn = document.querySelector('.note-save-btn');
noteSaveBtn.addEventListener('click', async () => {
  noteSaveBtn.disabled = true;
  showPreloader();
  showResponseFn('Please wait...');

  const {data, error} = await client.auth.getSession();
  if(error) {
    showPreloader(false);
    return showResponseFn(error.message);
  };

  if(!data.session) {
    showResponseFn('Please sign in');
    showPreloader(false);
    return signWindow.classList.add('show');
  }

  if(Object.keys(allNotesObj).find(name => allNotesObj[name].txt.replaceAll('\n','').length > 1500)) return showResponseFn('Some notes are too long!');

  const id = data.session.user.id;
  const {data: initialContent, error: initialError} = await client.from('user_content').select('content').eq('id', id).single();
  if(initialError) {
    showPreloader(false);
    setTimeout(() => {noteSaveBtn.disabled = false}, 150000);
    return showResponseFn("Something went wrong");
  }
  initialContent.content.notes = allNotesObj;
  const {error: tableError} = await client.from('user_content').update({content: initialContent.content}).eq('id', id);
  if(tableError) {
    showPreloader(false);
    setTimeout(() => noteSaveBtn.disabled = false, 150000);
    return showResponseFn("Your notes haven't been saved, pease try again later...");
  }

  noteSaveBtn.classList.remove('unsaved');

  setTimeout(() => noteSaveBtn.disabled = false, 150000);
  showResponseFn('Your notes have been saved');
  showPreloader(false);
})

// Save urls content
const urlSaveBtn = document.querySelector('.url-save-btn');
urlSaveBtn.addEventListener('click', async () => {
  urlSaveBtn.disabled = true;
  showPreloader();
  showResponseFn('Please wait...');

  const {data, error} = await client.auth.getSession();
  if(error) {
    showPreloader(false);
    return showResponseFn(error.message);
  };

  if(!data.session) {
    showResponseFn('Please sign in');
    showPreloader(false);
    return signWindow.classList.add('show');
  }

  const id = data.session.user.id;
  const {data: initialContent, error: initialError} = await client.from('user_content').select('content').eq('id', id).single();
  if(initialError) {
    showPreloader(false);
    setTimeout(() => {urlSaveBtn.disabled = false}, 150000);
    return showResponseFn("Something went wrong");
  }
  initialContent.content.urls = allUrlsObj;
  const {error: tableError} = await client.from('user_content').update({content: initialContent.content}).eq('id', id);
  if(tableError) {
    showPreloader(false);
    setTimeout(() => urlSaveBtn.disabled = false, 150000);
    return showResponseFn("Your urls haven't been saved, pease try again later...");
  }

  urlSaveBtn.classList.remove('unsaved');

  setTimeout(() => urlSaveBtn.disabled = false, 150000);
  showResponseFn('Your urls have been saved');
  showPreloader(false);
})

// Save codes content
const codeSaveBtn = document.querySelector('.code-save-btn');
codeSaveBtn.addEventListener('click', async () => {
  codeSaveBtn.disabled = true;
  showPreloader();
  showResponseFn('Please wait...');

  const {data, error} = await client.auth.getSession();
  if(error) {
    showPreloader(false);
    return showResponseFn(error.message);
  };
  if(!data.session) {
    showPreloader(false);
    showResponseFn('Please sign in');
    signWindow.classList.add('show');
  }

  let isHeightLength = false;
  for(let block of allUserCodesContainer.children) {
    const userCode = block.querySelector('textarea')._editor.getValue();
    if(userCode.replaceAll(' ','').replaceAll('\n','').length > 1500) isHeightLength = true;

    allUserCodesObj[block.firstElementChild.textContent].code = userCode
    .trim()
    .split('\n')
    .map(word => word.trimRight())
    .join('\n');
  }
  if(isHeightLength) {
    showPreloader(false);
    return showResponseFn('Some codes are too long.');
  };

  const id = data.session.user.id;
  const {data: initialContent, error: initialError} = await client.from('user_content').select('content').eq('id', id).single();
  if(initialError) {
    showPreloader(false);
    setTimeout(() => {codeSaveBtn.disabled = false}, 150000);
    return showResponseFn("Something went wrong");
  }
  initialContent.content.codes = allUserCodesObj;
  const {error: tableError} = await client.from('user_content').update({content: initialContent.content}).eq('id', id);
  if(tableError) {
    showPreloader(false);
    setTimeout(() => codeSaveBtn.disabled = false, 150000);
    return showResponseFn("Your codes haven't been saved, pease try again later...");
  }

  codeSaveBtn.classList.remove('unsaved');

  setTimeout(() => codeSaveBtn.disabled = false, 150000);
  showResponseFn('Your codes have been saved');
  showPreloader(false);
})

// Reload confirm
const allSavedBtn = [...document.querySelectorAll('.--saved-btn')];
window.addEventListener('beforeunload', e => {
  if(allSavedBtn.find(btn => btn.classList.contains('unsaved'))) {
    e.preventDefault();
    return e.returnValue = '';
  }
})

reloadAllContent();