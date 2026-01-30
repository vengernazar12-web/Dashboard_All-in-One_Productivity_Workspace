// Set preloader text
whatIsLoadingText.textContent = 'Loading authentication...';

const client = supabase.createClient(
  'https://ivzrhxvrwafrofotkmrv.supabase.co',
  'sb_publishable_gaf3l7-dqfddZGEZjBbatA_-AjzhiZ-'
);
const signWindow = document.querySelector('.sign-window');

const signUpForm = signWindow.querySelector('.sign-up-form');
const signInForm = signWindow.querySelector('.sign-in-form');

// Sign-in/up fn
async function signFn(type) {
  const email = type === 'up' ? signUpForm['user-email'].value : signInForm['user-email'].value;
  const password = type === 'up' ? signUpForm['user-password'].value : signInForm['user-password'].value;

  try {
    // Sign-up
    if(type === 'up') {
      const {error} = await client.auth.signUp({email, password});
      if(error) return showResponseFn(error.message);
      showResponseFn('Check your email address and use sign-in form');
    }
    else {
      // Sign in
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

signUpForm.addEventListener('submit', e => { e.preventDefault(); signFn('up'); });
signInForm.addEventListener('submit', e => { e.preventDefault(); signFn('in'); });

// is unsaved marks
let isTodosUnsaved = false,
isNotesUnsaved = false,
isUrlsUnsaved = false,
isCodesUnsaved = false;

// Save todos content
const todoSaveBtn = todoWrap.querySelector('.todo-save-btn');
todoSaveBtn.addEventListener('click', async () => {
  /* Is unsaved check */ if(!isTodosUnsaved) return showResponseFn('No changes detected — nothing to save.');
  // Set max function action
  preloaderProgress.max = 3;
  preloaderProgress.value = 0;
  whatIsLoadingText.textContent = 'Start...';

  todoSaveBtn.disabled = true;
  showPreloader();
  showResponseFn('Please wait...');
  if((Object.keys(allTodosObj).length + Object.keys(hiddenTodosObj).length) > 100) { showPreloader(false); return showResponseFn('You have todos limit')};

  const {data, error} = await client.auth.getSession();
  if(error) {
    showPreloader(false);
    return showResponseFn(error.message);
  };
  if(!data.session) {
    signWindow.classList.add('show');
    showPreloader(false);
    return showResponseFn("Please sign in");
  };

  preloaderProgress.value = 1;
  whatIsLoadingText.textContent = 'The session has been taken';

  const id = data.session.user.id;

  const {data: initialContent, error: initialError} = await client.from('user_content').select('content').eq('id', id).single();
  if(initialError) {
    showPreloader(false);
    setTimeout(() => {todoSaveBtn.disabled = false}, 150000);
    return showResponseFn("Something went wrong");
  }

  preloaderProgress.value = 2;
  whatIsLoadingText.textContent = 'Old content taken';

  initialContent.content.todos = allTodosObj;
  initialContent.content.hiddenTodos = hiddenTodosObj;

  const {error: tableError} = await client.from('user_content').update({content: initialContent.content}).eq('id', id);
  if(tableError) {
    showPreloader(false);
    setTimeout(() => todoSaveBtn.disabled = false, 15000);
    return showResponseFn("Your todos haven't been saved, pease try again later...");
  }

  preloaderProgress.value = 3;
  whatIsLoadingText.textContent = 'Content saved';

  todoSaveBtn.classList.remove('unsaved');
  isTodosUnsaved = false;

  setTimeout(() => todoSaveBtn.disabled = false, 15000);
  showResponseFn('Your todos have been saved');
  setTimeout(() => showPreloader(false), 500);
})

// Save notes content
const noteSaveBtn = notesWrap.querySelector('.note-save-btn');
noteSaveBtn.addEventListener('click', async () => {
  /* Is unsaved check */ if(!isNotesUnsaved) return showResponseFn('No changes detected — nothing to save.');
  // Set max function action
  preloaderProgress.max = 4;
  preloaderProgress.value = 0;
  whatIsLoadingText.textContent = 'Start...';

  noteSaveBtn.disabled = true;
  showPreloader();
  showResponseFn('Please wait...');

  const arr = Object.keys(allNotesObj);

  if(arr.length > 25) {
    showPreloader(false);
    return showResponseFn('You have notes blocks limit');
  };
  if(arr.find(name => allNotesObj[name].txt.replaceAll('\n','').length > 2000)) {
    showPreloader(false);
    return showResponseFn('Some notes are too long!');
  };

  preloaderProgress.value = 1;
  whatIsLoadingText.textContent = 'The texts have been checked';

  const {data, error} = await client.auth.getSession();
  if(error) {
    showPreloader(false);
    return showResponseFn(error.message);
  };
  if(!data.session) {
    showResponseFn('Please sign in');
    showPreloader(false);
    return signWindow.classList.add('show');
  };

  preloaderProgress.value = 2;
  whatIsLoadingText.textContent = 'The session has been taken';

  const id = data.session.user.id;

  const {data: initialContent, error: initialError} = await client.from('user_content').select('content').eq('id', id).single();
  if(initialError) {
    showPreloader(false);
    setTimeout(() => {noteSaveBtn.disabled = false}, 150000);
    return showResponseFn("Something went wrong");
  }

  preloaderProgress.value = 3;
  whatIsLoadingText.textContent = 'Old content taken';

  initialContent.content.notes = allNotesObj;
  const {error: tableError} = await client.from('user_content').update({content: initialContent.content}).eq('id', id);
  if(tableError) {
    showPreloader(false);
    setTimeout(() => noteSaveBtn.disabled = false, 150000);
    return showResponseFn("Your notes haven't been saved, pease try again later...");
  }

  preloaderProgress.value = 4;
  whatIsLoadingText.textContent = 'Content saved';

  noteSaveBtn.classList.remove('unsaved');
  isNotesUnsaved = false;

  setTimeout(() => noteSaveBtn.disabled = false, 150000);
  showResponseFn('Your notes have been saved');
  setTimeout(() => showPreloader(false), 500);
})

// Save urls content
const urlSaveBtn = urlsWrap.querySelector('.url-save-btn');
urlSaveBtn.addEventListener('click', async () => {
  /* Is unsaved check */ if(!isUrlsUnsaved) return showResponseFn('No changes detected — nothing to save.');
  // Set max function action
  preloaderProgress.max = 5;
  preloaderProgress.value = 0;
  whatIsLoadingText.textContent = 'Start...';

  urlSaveBtn.disabled = true;
  showPreloader();
  showResponseFn('Please wait...');
  if(allUrlsArr.length > 50) { showPreloader(false); return showResponseFn('Your have urls limit')};

  const {data, error} = await client.auth.getSession();
  if(error) {
    showPreloader(false);
    return showResponseFn(error.message);
  };
  if(!data.session) {
    showResponseFn('Please sign in');
    showPreloader(false);
    return signWindow.classList.add('show');
  };

  preloaderProgress.value = 1;
  whatIsLoadingText.textContent = 'The session has been taken';

  const id = data.session.user.id;

  const {data: initialContent, error: initialError} = await client.from('user_content').select('content').eq('id', id).single();
  if(initialError) {
    showPreloader(false);
    setTimeout(() => {urlSaveBtn.disabled = false}, 150000);
    return showResponseFn("Something went wrong");
  }

  preloaderProgress.value = 2;
  whatIsLoadingText.textContent = 'Old content taken';

  initialContent.content.urls = allUrlsArr;
  const {error: tableError} = await client.from('user_content').update({content: initialContent.content}).eq('id', id);
  if(tableError) {
    showPreloader(false);
    setTimeout(() => urlSaveBtn.disabled = false, 150000);
    return showResponseFn("Your urls haven't been saved, pease try again later...");
  }

  preloaderProgress.value = 3;
  whatIsLoadingText.textContent = 'Content saved';

  // Upload and remove imgs
  for(let path in filesToUpload) {
    const {error} = await client.storage.from('images').upload(path, filesToUpload[path]);
    if(error) {
      renderAllUrls();
      showPreloader(false);
      return showResponseFn(`Error: ${error}`);
    };
    delete filesToUpload[path];

    const urlName = allUrlsArr.find(obj => obj.imgPath === path)?.title;
    for(let block of allUrlsContainer.children) {
      if(block.querySelector('a').textContent === urlName) {
        block.classList.remove('unsaved');
        delete localImgUrls[urlName];
        break;
      }
    }
  };

  preloaderProgress.value = 4;
  whatIsLoadingText.textContent = 'All images uploaded';

  for(let path of filesToRemove) client.storage.from('images').remove([path]);

  preloaderProgress.value = 5;
  whatIsLoadingText.textContent = 'File cleanup';

  // Path
  filesToRemove = [];

  renderAllUrls();

  // Upload and remove imgs

  urlSaveBtn.classList.remove('unsaved');
  isUrlsUnsaved = false;

  setTimeout(() => urlSaveBtn.disabled = false, 150000);
  showResponseFn('Your urls have been saved');
  setTimeout(() => showPreloader(false), 500);
})

// Save codes content
const codeSaveBtn = userCodeWrap.querySelector('.code-save-btn');
codeSaveBtn.addEventListener('click', async () => {
  /* Is unsaved check */ if(!isCodesUnsaved) return showResponseFn('No changes detected — nothing to save.');
  // Set max function action
  preloaderProgress.max = 4;
  preloaderProgress.value = 0;
  whatIsLoadingText.textContent = 'Start...';

  codeSaveBtn.disabled = true;
  showPreloader();
  showResponseFn('Please wait...');

  if(Object.keys(allUserCodesObj).length > 25) {
    showPreloader(false);
    return showResponseFn('Your have codes blocks limit');
  };

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

  preloaderProgress.value = 1;
  whatIsLoadingText.textContent = 'Clean code uploaded + length checked';

  const {data, error} = await client.auth.getSession();
  if(error) {
    showPreloader(false);
    return showResponseFn(error.message);
  };
  if(!data.session) {
    showPreloader(false);
    showResponseFn('Please sign in');
    signWindow.classList.add('show');
  };

  preloaderProgress.value = 2;
  whatIsLoadingText.textContent = 'The session has been taken';

  const id = data.session.user.id;

  const {data: initialContent, error: initialError} = await client.from('user_content').select('content').eq('id', id).single();
  if(initialError) {
    showPreloader(false);
    setTimeout(() => {codeSaveBtn.disabled = false}, 150000);
    return showResponseFn("Something went wrong");
  };

  preloaderProgress.value = 3;
  whatIsLoadingText.textContent = 'Old content taken';

  initialContent.content.codes = allUserCodesObj;
  const {error: tableError} = await client.from('user_content').update({content: initialContent.content}).eq('id', id);
  if(tableError) {
    showPreloader(false);
    setTimeout(() => codeSaveBtn.disabled = false, 150000);
    return showResponseFn("Your codes haven't been saved, pease try again later...");
  }

  preloaderProgress.value = 4;
  whatIsLoadingText.textContent = 'Content saved';

  codeSaveBtn.classList.remove('unsaved');
  isCodesUnsaved = false;

  setTimeout(() => codeSaveBtn.disabled = false, 150000);
  showResponseFn('Your codes have been saved');
  setTimeout(() => showPreloader(false), 500);
})

// Reload confirm
const allSavedBtn = document.querySelectorAll('.--saved-btn');
window.addEventListener('beforeunload', e => {
  for(let btn of allSavedBtn) {
    if(btn.classList.contains('unsaved')) {
      e.preventDefault();
      e.returnValue = '';
      break;
    }
  }
})

// Initialization all content objects
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
    allUrlsArr = content.urls || [];
    allUserCodesObj = content.codes || {};
    setTimeout(() => showPreloader(false), 500);
    return showResponseFn('Your content been loaded');
  }
  else { showPreloader(false); signWindow.classList.add('show'); };
}
// Set preloader value
preloaderProgress.value = 7;

// Starter function
reloadAllContent();