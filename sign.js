// Set preloader text
whatIsLoadingText.textContent = 'Loading authentication...';

const client = supabase.createClient(
  'https://ivzrhxvrwafrofotkmrv.supabase.co',
  'sb_publishable_gaf3l7-dqfddZGEZjBbatA_-AjzhiZ-'
);

let userId = null;

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
      await initAccountInfos();
      signWindow.classList.remove('show');
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
  preloaderProgress.max = 1;
  preloaderProgress.value = 0;
  whatIsLoadingText.textContent = 'Start...';
  renderTodos();

  todoSaveBtn.disabled = true;
  showPreloader();

  if(Object.keys(allTodosObj).length > allBlockLimitsObj.todos) {
    showPreloader(false);
    setTimeout(() => {todoSaveBtn.disabled = false}, 150000);
    return showResponseFn('You have todos limit');
  };

  const {error: tableError} = await client.from('user_content').update({todos: allTodosObj}).eq('id', userId);
  if(tableError) {
    showPreloader(false);
    setTimeout(() => todoSaveBtn.disabled = false, 15000);
    return showResponseFn(`Your todos haven't been saved, pease try again later...`);
  }

  preloaderProgress.value = 1;
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
  preloaderProgress.max = 1;
  preloaderProgress.value = 0;
  whatIsLoadingText.textContent = 'Start...';
  renderNotesBlocks();

  noteSaveBtn.disabled = true;
  showPreloader();

  const arr = Object.keys(allNotesObj);

  if(arr.length > allBlockLimitsObj.notes) {
    showPreloader(false);
    setTimeout(() => {noteSaveBtn.disabled = false}, 150000);
    return showResponseFn('You have notes blocks limit');
  };
  if(arr.find(name => allNotesObj[name].txt.replaceAll('\n','').length > allValuesLimit.notesContent || allNotesObj[name].description.length > allValuesLimit.noteDesc)) {
    showPreloader(false);
    setTimeout(() => {noteSaveBtn.disabled = false}, 150000);
    return showResponseFn('Some note has very long content or description.');
  };

  const {error: tableError} = await client.from('user_content').update({notes: allNotesObj}).eq('id', userId);
  if(tableError) {
    showPreloader(false);
    setTimeout(() => noteSaveBtn.disabled = false, 150000);
    return showResponseFn(`Your notes haven't been saved, pease try again later...`);
  }

  preloaderProgress.value = 1;
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
  preloaderProgress.max = 3;
  preloaderProgress.value = 0;
  whatIsLoadingText.textContent = 'Start...';
  renderAllUrls();

  urlSaveBtn.disabled = true;
  showPreloader();

  if(Object.keys(allUrlsObj).length > allBlockLimitsObj.urls) {
    showPreloader(false);
    setTimeout(() => {urlSaveBtn.disabled = false}, 150000);
    return showResponseFn('You have urls limit');
  };

  const {error: tableError} = await client.from('user_content').update({urls: allUrlsObj}).eq('id', userId);
  if(tableError) {
    showPreloader(false);
    setTimeout(() => urlSaveBtn.disabled = false, 150000);
    return showResponseFn(`Your urls haven't been saved, pease try again later...`);
  }

  preloaderProgress.value = 1;
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

  preloaderProgress.value = 2;
  whatIsLoadingText.textContent = 'All images uploaded';

  // Remove
  for(let path of filesToRemove) client.storage.from('images').remove([path]);

  // Url-name: imgUrl
  localImgUrls = {};
  // Path: imgUrl
  filesToUpload = {};
  // Path
  filesToRemove = [];

  preloaderProgress.value = 3;
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
  preloaderProgress.max = 1;
  preloaderProgress.value = 0;
  whatIsLoadingText.textContent = 'Start...';
  renderUserCodesBlocks();

  codeSaveBtn.disabled = true;
  showPreloader();

  if(Object.keys(allUserCodesObj).length > allBlockLimitsObj.codes) {
    showPreloader(false);
    setTimeout(() => {codeSaveBtn.disabled = false}, 150000);
    return showResponseFn('You have codes blocks limit');
  };

  let isHeightLength = false;
  for(let block of allUserCodesContainer.children) {
    const userCode = block.querySelector('textarea')._editor.getValue();
    if(userCode.replace(/\s/g,'').length > allValuesLimit.codeContent) isHeightLength = true;

    allUserCodesObj[block.firstElementChild.textContent].code = userCode
    .trim()
    .split('\n')
    .map(word => word.trimRight())
    .join('\n')
    .trim();
  }
  if(isHeightLength) {
    showPreloader(false);
    setTimeout(() => {codeSaveBtn.disabled = false}, 150000);
    return showResponseFn('Some codes are too long.');
  };

  const {error: tableError} = await client.from('user_content').update({codes: allUserCodesObj}).eq('id', userId);
  if(tableError) {
    showPreloader(false);
    setTimeout(() => codeSaveBtn.disabled = false, 150000);
    return showResponseFn(`Your codes haven't been saved, pease try again later...`);
  }

  preloaderProgress.value = 1;
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
  preloaderProgress.max = 1;
  preloaderProgress.value = 0;
  whatIsLoadingText.textContent = 'Start...';
  renderTextsSnippets();

  textSaveBtn.disabled = true;
  showPreloader();

  const allNames = Object.keys(allTextsSnippetsObj);

  if(allNames.length > allBlockLimitsObj.text) {
    showPreloader(false);
    setTimeout(() => {textSaveBtn.disabled = false}, 150000);
    return showResponseFn('You have text blocks limit');
  };

  if(allNames.find(n => n.length > allValuesLimit.textName || allTextsSnippetsObj[n].txt.length > allValuesLimit.textContent)) {
    showPreloader(false);
    setTimeout(() => {textSaveBtn.disabled = false}, 150000);
    return showResponseFn('You have length limit');
  };

  const {error: tableError} = await client.from('user_content').update({texts: allTextsSnippetsObj}).eq('id', userId);
  if(tableError) {
    showPreloader(false);
    setTimeout(() => textSaveBtn.disabled = false, 150000);
    return showResponseFn(`Your texts haven't been saved, pease try again later...`);
  }

  preloaderProgress.value = 1;
  whatIsLoadingText.textContent = 'Content saved';

  textSaveBtn.classList.remove('unsaved');

  setTimeout(() => textSaveBtn.disabled = false, 150000);
  showResponseFn('Your texts have been saved');
  setTimeout(() => showPreloader(false), 500);
})

// Save music content
const musicSaveBtn = musicWrap.querySelector('.save-music-btn');
musicSaveBtn.addEventListener('click', async () => {
  undoLastActionBlock.classList.remove('show');
  /* Is unsaved check */ if(!musicSaveBtn.classList.contains('unsaved')) return showResponseFn('No changes detected — nothing to save.');
  // Set max function action
  preloaderProgress.max = 1;
  preloaderProgress.value = 0;
  whatIsLoadingText.textContent = 'Start...';
  renderMusic();

  musicSaveBtn.disabled = true;
  showPreloader();

  const allNames = Object.keys(allMusicObj);

  if(allNames.length > allBlockLimitsObj.music) {
    showPreloader(false);
    setTimeout(() => {musicSaveBtn.disabled = false}, 150000);
    return showResponseFn('You have music blocks limit');
  };

  if(allNames.find(n => n.length > allValuesLimit.musicName)) {
    showPreloader(false);
    setTimeout(() => {musicSaveBtn.disabled = false}, 150000);
    return showResponseFn('You have name length limit');
  };

  const {error: tableError} = await client.from('user_content').update({music: allMusicObj}).eq('id', userId);
  if(tableError) {
    showPreloader(false);
    setTimeout(() => {musicSaveBtn.disabled = false}, 150000);
    return showResponseFn(`Your music haven't been saved, pease try again later...`);
  }

  preloaderProgress.value = 1;
  whatIsLoadingText.textContent = 'Content saved';

  musicSaveBtn.classList.remove('unsaved');

  setTimeout(() => musicSaveBtn.disabled = false, 150000);
  showResponseFn('Your music have been saved');
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

// Set open btns texts
function setOpenBtnsTexts() {
  openTodoWrapBtn.lastElementChild.textContent = `${allTodosObj ? Object.keys(allTodosObj).length : 'Not loaded'} / ${allBlockLimitsObj.todos}`;
  openNoteWrapBtn.lastElementChild.textContent = `${allNotesObj ? Object.keys(allNotesObj).length : 'Not loaded'} / ${allBlockLimitsObj.notes}`;
  openUrlWrapBtn.lastElementChild.textContent = `${allUrlsObj ? Object.keys(allUrlsObj).length : 'Not loaded'} / ${allBlockLimitsObj.urls}`;
  openCodeWrapBtn.lastElementChild.textContent = `${allUserCodesObj ? Object.keys(allUserCodesObj).length : 'Not loaded'} / ${allBlockLimitsObj.codes}`;
  openTextsSnippetsWrap.lastElementChild.textContent = `${allTextsSnippetsObj ? Object.keys(allTextsSnippetsObj).length : 'Not loaded'} / ${allBlockLimitsObj.text}`;
  openMusicWrapBtn.lastElementChild.textContent = `${allMusicObj ? Object.keys(allMusicObj).length : 'Not loaded'} / ${allBlockLimitsObj.music}`;
}

// Take session id
async function initAccountInfos() {
  try {
    let { data: sessionData, error: sessionError } = await client.auth.getSession();
    if (sessionError) {
      showPreloader(false);
      signWindow.classList.add('show');
      return showResponseFn(sessionError);
    };
    if (!sessionData.session) {
      showPreloader(false);
      return signWindow.classList.add('show');
    };
    const id = sessionData.session.user.id;
    userId = id;

    const {data: limitsData} = await client.from('app_content_limits').select('*').eq('id', 1).single();
    allBlockLimitsObj = limitsData.blocks;
    allValuesLimit = limitsData.values;

    showPreloader(false);
    setOpenBtnsTexts();

    const { data: imgs, error: imgsError } = await client.storage.from('avatars').list('', { limit: 1000 });
    if (imgsError) showResponseFn('Error loading avatars');
    else {
      allAvatarsArr = await Promise.all(
        imgs.map(avatarObj => {
          const name = avatarObj.name;
          const url = client.storage.from('avatars').getPublicUrl(name).data.publicUrl;
          return { name, url };
        })
      );

      const initAvatar = await client.from('user_content').select('profile').eq('id', userId).single();

      openBtnProfileImg.src = initAvatar.data.profile === -1
        ? '/all-imgs/no-profile-icon.webp'
        : allAvatarsArr.find(o => o.name === `${initAvatar.data.profile}.png`)?.url;
    }

    showResponseFn('Loaded!');

    // Set all blocks limits
    todoProgress.max = allBlockLimitsObj.todos;
    noteProgress.max = allBlockLimitsObj.notes;
    urlProgress.max = allBlockLimitsObj.urls;
    codeProgress.max = allBlockLimitsObj.codes;
    textProgress.max = allBlockLimitsObj.text;
    musicProgress.max = allBlockLimitsObj.music;
  } catch(e) {
    console.error(e);
    showPreloader(false);
    showResponseFn(`Error: ${e}`);
  }
}

// Get content
async function getContent(type) {
  const {data, error} = await client.from('user_content').select(type).eq('id', userId).single();
  if(error) {
    console.error(error);
    showResponseFn('Something went wrong, please try again later...');
    return null;
  }
  return data[type];
}

// Starter function
initAccountInfos();

// Set preloader value
preloaderProgress.value = preloaderProgress.max;