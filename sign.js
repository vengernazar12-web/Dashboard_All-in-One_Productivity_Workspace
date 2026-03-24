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

// Save todos content
const todoSaveBtn = todoWrap.querySelector('.todo-save-btn');
todoSaveBtn.addEventListener('click', async () => {
  undoLastActionBlock.classList.remove('show');
  /* Is unsaved check */ if(!todoSaveBtn.classList.contains('unsaved')) return showResponseFn('No changes detected — nothing to save.');
  // Set max function action
  preloaderProgress.max = 3;
  preloaderProgress.value = 0;
  whatIsLoadingText.textContent = 'Start...';
  renderTodos();

  todoSaveBtn.disabled = true;
  showPreloader();
  showResponseFn('Please wait...');
  if((Object.keys(allTodosObj).length + Object.keys(hiddenTodosObj).length) > allBlockLimitsObj.todos) {
    showPreloader(false);
    return showResponseFn('You have todos limit');
  };

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

  setTimeout(() => todoSaveBtn.disabled = false, 15000);
  showResponseFn('Your todos have been saved');
  setTimeout(() => showPreloader(false), 500);
})

// Save notes content
const noteSaveBtn = notesWrap.querySelector('.note-save-btn');
noteSaveBtn.addEventListener('click', async () => {
  undoLastActionBlock.classList.remove('show');
  /* Is unsaved check */ if(!noteSaveBtn.classList.contains('unsaved')) return showResponseFn('No changes detected — nothing to save.');
  // Set max function action
  preloaderProgress.max = 4;
  preloaderProgress.value = 0;
  whatIsLoadingText.textContent = 'Start...';
  renderNotesBlocks();

  noteSaveBtn.disabled = true;
  showPreloader();
  showResponseFn('Please wait...');

  const arr = Object.keys(allNotesObj);

  if(arr.length > allBlockLimitsObj.notes) {
    showPreloader(false);
    return showResponseFn('You have notes blocks limit');
  };
  if(arr.find(name => allNotesObj[name].txt.replaceAll('\n','').length > 2000 || allNotesObj[name].description.length > 250)) {
    showPreloader(false);
    return showResponseFn('Some note has very long content or description.');
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

  setTimeout(() => noteSaveBtn.disabled = false, 150000);
  showResponseFn('Your notes have been saved');
  setTimeout(() => showPreloader(false), 500);
})

// Save urls content
const urlSaveBtn = urlsWrap.querySelector('.url-save-btn');
urlSaveBtn.addEventListener('click', async () => {
  undoLastActionBlock.classList.remove('show');
  /* Is unsaved check */ if(!urlSaveBtn.classList.contains('unsaved')) return showResponseFn('No changes detected — nothing to save.');
  // Set max function action
  preloaderProgress.max = 5;
  preloaderProgress.value = 0;
  whatIsLoadingText.textContent = 'Start...';
  renderAllUrls();

  urlSaveBtn.disabled = true;
  showPreloader();
  showResponseFn('Please wait...');
  if(allUrlsArr.length > allBlockLimitsObj.urls) { showPreloader(false); return showResponseFn('Your have urls limit')};

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
  // Upload
  for(let path in filesToUpload) {
    const {error} = await client.storage.from('images').upload(path, filesToUpload[path]);
    if(error) {
      renderAllUrls();
      showPreloader(false);
      return showResponseFn(`Error: ${error}`);
    };
  };

  preloaderProgress.value = 4;
  whatIsLoadingText.textContent = 'All images uploaded';

  // Remove
  for(let path of filesToRemove) client.storage.from('images').remove([path]);

  // Url-name: imgUrl
  localImgUrls = {};
  // Path: imgUrl
  filesToUpload = {};
  // Path
  filesToRemove = [];

  preloaderProgress.value = 5;
  whatIsLoadingText.textContent = 'File cleanup';

  // Path
  filesToRemove = [];
  // Upload and remove imgs

  urlSaveBtn.classList.remove('unsaved');

  setTimeout(() => urlSaveBtn.disabled = false, 150000);
  showResponseFn('Your urls have been saved');
  setTimeout(() => showPreloader(false), 500);
})

// Save codes content
const codeSaveBtn = userCodeWrap.querySelector('.code-save-btn');
codeSaveBtn.addEventListener('click', async () => {
  undoLastActionBlock.classList.remove('show');
  /* Is unsaved check */ if(!codeSaveBtn.classList.contains('unsaved')) return showResponseFn('No changes detected — nothing to save.');
  // Set max function action
  preloaderProgress.max = 4;
  preloaderProgress.value = 0;
  whatIsLoadingText.textContent = 'Start...';
  renderUserCodesBlocks();

  codeSaveBtn.disabled = true;
  showPreloader();
  showResponseFn('Please wait...');

  if(Object.keys(allUserCodesObj).length > allBlockLimitsObj.codes) {
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

  setTimeout(() => codeSaveBtn.disabled = false, 150000);
  showResponseFn('Your codes have been saved');
  setTimeout(() => showPreloader(false), 500);
})

// Save texts content
const textSaveBtn = textsSnippetsWrap.querySelector('.save-texts-snippets');
textSaveBtn.addEventListener('click', async () => {
  undoLastActionBlock.classList.remove('show');
  /* Is unsaved check */ if(!textSaveBtn.classList.contains('unsaved')) return showResponseFn('No changes detected — nothing to save.');
  // Set max function action
  preloaderProgress.max = 4;
  preloaderProgress.value = 0;
  whatIsLoadingText.textContent = 'Start...';
  renderTextsSnippets();

  textSaveBtn.disabled = true;
  showPreloader();
  showResponseFn('Please wait...');

  const allNames = Object.keys(allTextsSnippetsObj);

  if(allNames.length > allBlockLimitsObj.text) {
    showPreloader(false);
    return showResponseFn('Your have text blocks limit');
  };

  if(allNames.find(n => n.length > allValuesLimit.textName || allTextsSnippetsObj[n].txt.length > allValuesLimit.textContent)) {
    showPreloader(false);
    return showResponseFn('You have length limit');
  };

  preloaderProgress.value = 1;
  whatIsLoadingText.textContent = 'Length checked';

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

  initialContent.content.texts = allTextsSnippetsObj;
  const {error: tableError} = await client.from('user_content').update({content: initialContent.content}).eq('id', id);
  if(tableError) {
    showPreloader(false);
    setTimeout(() => codeSaveBtn.disabled = false, 150000);
    return showResponseFn("Your texts haven't been saved, pease try again later...");
  }

  preloaderProgress.value = 4;
  whatIsLoadingText.textContent = 'Content saved';

  textSaveBtn.classList.remove('unsaved');

  setTimeout(() => codeSaveBtn.disabled = false, 150000);
  showResponseFn('Your codes have been saved');
  setTimeout(() => showPreloader(false), 500);
})

// Reload confirm
const allSavedBtn = document.querySelectorAll('.is-wrap > .--saved-btn');
window.addEventListener('beforeunload', e => {
  for(let btn of allSavedBtn) {
    if(btn.classList.contains('unsaved')) {
      e.preventDefault();
      e.returnValue = '';
      break;
    }
  }
})

// Set all blocks limits
todoProgress.max = allBlockLimitsObj.todos;
noteProgress.max = allBlockLimitsObj.notes;
urlProgress.max = allBlockLimitsObj.urls;
codeProgress.max = allBlockLimitsObj.codes;

// Set open btns texts
function setOpenBtnsTexts() {
  openTodoWrapBtn.lastElementChild.textContent = `${Object.keys(allTodosObj).length + Object.keys(hiddenTodosObj).length}/${allBlockLimitsObj.todos}`;
  openNoteWrapBtn.lastElementChild.textContent = `${Object.keys(allNotesObj).length}/${allBlockLimitsObj.notes}`;
  openUrlWrapBtn.lastElementChild.textContent = `${allUrlsArr.length}/${allBlockLimitsObj.urls}`;
  openCodeWrapBtn.lastElementChild.textContent = `${Object.keys(allUserCodesObj).length}/${allBlockLimitsObj.codes}`;
  openTextsSnippetsWrap.lastElementChild.textContent = `${Object.keys(allTextsSnippetsObj).length}/${allBlockLimitsObj.text}`;
}

// Initialization all content objects
async function reloadAllContent() {
  let {data: sessionData, error: sessionError} = await client.auth.getSession();
  if(sessionError) {
    signWindow.classList.add('show');
    return showResponseFn(sessionError);
  };
  if(!sessionData.session) {
    showPreloader(false);
    return signWindow.classList.add('show');
  };
  const id = sessionData.session.user.id;
  const {data: initialContent, error} = await client.from('user_content').select('*').eq('id', id).single();
  if(error) {
    showResponseFn('Something went wrong, please sign in or sign up');
    showPreloader(false);
    return signWindow.classList.add('show');
  }
  if(initialContent) {
    memoryForAi = initialContent.memory || '';

    const content = initialContent.content;
    allTodosObj = content.todos || {};
    hiddenTodosObj = content.hiddenTodos || {};
    allNotesObj = content.notes || {};
    allUrlsArr = content.urls || [];
    allUserCodesObj = content.codes || {};
    allTextsSnippetsObj = content.texts || {};
    setTimeout(() => showPreloader(false), 500);

    const { data: imgs, error: imgsError } = await client.storage.from('avatars').list('', { limit: 1000 });
    if(imgsError) showResponseFn('Error loading avatar');
    else {
      allAvatarsArr = await Promise.all(
        imgs.map(avatarObj => {
          const name = avatarObj.name;
          const url = client.storage.from('avatars').getPublicUrl(name).data.publicUrl;
          return { name, url };
        })
      );

      openBtnProfileImg.src = initialContent.profile === -1
      ? '/all-imgs/no-profile-icon.webp'
      : allAvatarsArr.find(o => o.name === `${initialContent.profile}.png`)?.url;
    }

    setOpenBtnsTexts();

    const resp = await fetch(`https://695054688531714d9bd055c4.mockapi.io/dashboard/updates`);
    const data = await resp.json();
    updatesList = data[0]['updates-list'].join('\n');
    return showResponseFn('Your content been loaded');
  } else {
    showPreloader(false);
    signWindow.classList.add('show');
  };
}
// Set preloader value
preloaderProgress.value = preloaderProgress.max;

// Starter function
reloadAllContent();