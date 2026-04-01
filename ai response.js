let historyForAiPrompt = [];
let memoryForAi = '';
let updatesList = null;
async function getAiResponse(givenInfo) {
  try {
    assistantLoader.style.display = 'block';
    sendPromptBtn.disabled = true;
    const resp = await fetch('https://throbbing-night-c338.vengernazar0.workers.dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify({
        givenInfo: givenInfo,
        history: historyForAiPrompt,
        memoryForAi,
      })
    })
    assistantLoader.style.display = 'none';
    sendPromptBtn.disabled = false;

    const data = await resp.json();
    return data.txt;
  } catch(e) {
    console.error(e);
    assistantLoader.style.display = 'none';
    sendPromptBtn.disabled = false;
    return "Sorry, something went wrong...";
  }
}

// Use ai fn
async function useAiResp(givenInfo = '') {
  const respTxt = await getAiResponse(givenInfo);
  const insertCommands = respTxt.trim().match(/(?:\n|^)\?get\|[^\n]+/gi);
  let info = '';
  if(insertCommands) for(let comm of [...new Set(insertCommands)]) info += giveInfoForAi(comm.replace('?get|', '').trim());
  createAssistantResponse(respTxt);
  if(info) useAiResp(info);
}

// Get todos assistant resp
async function getTodosAssistantResp() {
  try {
    sendTodosAssistantPromptBtn.disabled = true;
    todosAssistantLoader.style.display = 'block';
    const resp = await fetch('https://todos-assistant.vengernazar0.workers.dev', {
      method: 'POST',
      headers: {'Content-Type': 'application/json',},
      body: JSON.stringify({
        history: historyForTodosAssistant,
        todosMeta: Object.keys(allTodosObj).map(n => `name: ${n}, mark: ${allTodosObj[n].mark}, tag: ${allTodosObj[n].tag}, completed: ${allTodosObj[n].isCompleted}, favorite: ${allTodosObj[n].isFav || false}, date: ${allTodosObj[n].date}`).join('\n') || 'У користувача ще немає туду',
        maxBlocks: allBlockLimitsObj.todos,
        maxNameLng: allValuesLimit.todoName,
        maxMarkLng: allValuesLimit.todoMark,
        maxTagLng: allValuesLimit.todoTag,
      }
    )})
    const data = await resp.text();
    sendTodosAssistantPromptBtn.disabled = false;
    todosAssistantLoader.style.display = 'none';
    return data;
  } catch(e) {
    console.error(e);
    sendTodosAssistantPromptBtn.disabled = false;
    todosAssistantLoader.style.display = 'none';
    return "Sorry, something went wrong...";
  }
}

// Get notes assistant resp
async function getNotesAssistantResp() {
  try {
    sendNotesPromptBtn.disabled = true;
    notesAssistantLoader.style.display = 'block';
    const resp = await fetch('https://notes-assistant.vengernazar0.workers.dev', {
      method: 'POST',
      headers: {'Content-Type': 'application/json',},
      body: JSON.stringify({
        history: historyForNotesAssistant,
        notesMeta: Object.keys(allNotesObj).map(n => `name: ${n}, description: ${allNotesObj[n].description}, favorite: ${allNotesObj[n].isFav || false}`).join('\n') || 'У користувача ще немає нотаток',
        maxBlocks: allBlockLimitsObj.notes,
        maxNameLng: allValuesLimit.noteName,
        maxDescLng: allValuesLimit.noteDesc,
        maxContentLng: 2000,
      }
    )})
    const data = await resp.text();
    notesAssistantLoader.style.display = 'none';
    sendNotesPromptBtn.disabled = false;
    return data;
  } catch(e) {
    console.error(e);
    notesAssistantLoader.style.display = 'none';
    sendNotesPromptBtn.disabled = false;
    return "Sorry, something went wrong...";
  }
}

// Get notesContent assistant resp
async function getNotesContentAssistantResp(userText, noteName) {
  try {
    sendNotesContentPromptBtn.disabled = true;
    notesContentAssistantLoader.style.display = 'block';
    const resp = await fetch('https://notes-text-assistant.vengernazar0.workers.dev', {
      method: 'POST',
      headers: {'Content-Type': 'application/json',},
      body: JSON.stringify({
        userText: userText,
        noteName: noteName,
        history: historyForNotesContentAssistant,
        maxContentLng: 2000
      }
    )})
    const data = await resp.text();
    sendNotesContentPromptBtn.disabled = false;
    notesContentAssistantLoader.style.display = 'none';
    return data;
  } catch(e) {
    console.error(e);
    sendNotesContentPromptBtn.disabled = false;
    notesContentAssistantLoader.style.display = 'none';
    return 'Sorry, something went wrong...';
  }
}

// Get urls assistant resp
async function getUrlsAssistantResp() {
  sendUrlsAssistantPrompt.disabled = true;
  urlsAssistantLoader.style.display = 'block';
  try {
    const resp = await fetch('https://urls-assistant.vengernazar0.workers.dev', {
      method: 'POST',
      headers: {'Content-Type': 'application/json',},
      body: JSON.stringify({
        history: historyForUrlsAssistant,
        urlsMeta: Object.keys(allUrlsObj).map(n => `name: ${n}, url: ${allUrlsObj[n].url}`).join('\n') || 'У користувача ще немає посилань',
        maxBlocks: allBlockLimitsObj.urls,
        maxNameLng: allValuesLimit.urlTitle,
      })
    })
    const data = await resp.text();
    sendUrlsAssistantPrompt.disabled = false;
    urlsAssistantLoader.style.display = 'none';
    return data;
  } catch(e) {
    console.error(e);
    sendUrlsAssistantPrompt.disabled = false;
    urlsAssistantLoader.style.display = 'none';
    return 'Sorry, something went wrong...';
  }
}

// Get codes assistant resp
async function getCodesAssistantResp() {
  try {
    sendCodesAssistantPromptBtn.disabled = true;
    codesAssistantLoader.style.display = 'block';
    const resp = await fetch('https://codes-assistant.vengernazar0.workers.dev', {
      method: 'POST',
      headers: {'Content-Type': 'application/json',},
      body: JSON.stringify({
        history: historyForCodesAssistant,
        codesMeta: Object.keys(allUserCodesObj).map(n => `name: ${n}, language: ${allUserCodesObj[n].lang}, content length: ${allUserCodesObj[n].code.replace(/\s/g, '').length}`).join('\n') || 'У користувача ще немає код-блоків',
        maxBlocks: allBlockLimitsObj.codes,
        maxNameLng: allValuesLimit.codeName,
        maxContentLng: '1500 без урахування пробілів та пустих рядків',
      })
    })
    const data = await resp.text();
    sendCodesAssistantPromptBtn.disabled = false;
    codesAssistantLoader.style.display = 'none';
    return data;
  } catch(e) {
    console.error(e);
    sendCodesAssistantPromptBtn.disabled = false;
    codesAssistantLoader.style.display = 'none';
    return 'Sorry, something went wrong...';
  }
}

// Get codes CONTENT assistant resp
async function getCodesContentAssistantResp() {
  try {
    codesContentAssistantLoader.style.display = 'block';
    sendCodesContentAssistantPromptBtn.disabled = true;
    const resp = await fetch('https://codes-content-assistant.vengernazar0.workers.dev', {
      method: 'POST',
      headers: {'Content-Type': 'application/json',},
      body: JSON.stringify({
        history: historyForCodesContentAssistant,
        userCode: focusCodeEditor.getValue() || 'У користувача ще немає коду...',
        codeName: focusCodeTitle.textContent,
        maxContentLng: '1500 символів(без урахування пробілів/пропусків)',
      })
    })
    const data = await resp.text();
    codesContentAssistantLoader.style.display = 'none';
    sendCodesContentAssistantPromptBtn.disabled = false;
    return data;
  } catch(e) {
    console.error(e);
    codesContentAssistantLoader.style.display = 'none';
    sendCodesContentAssistantPromptBtn.disabled = false;
  }
}

// Get text snippets assistant resp
async function getTextsSnippetsAssistantResp() {
  try {
    textSnippetsAssistantLoader.style.display = 'block';
    sendTextSnippetsPromptBtn.disabled = true;
    const resp = await fetch('https://text-snippets-assistant.vengernazar0.workers.dev', {
      method: 'POST',
      headers: {'Content-Type': 'application/json',},
      body: JSON.stringify({
        history: historyForTextSnippetsAssistant,
        textsMeta: Object.keys(allTextsSnippetsObj).map(n => `name: ${n}, length: ${allTextsSnippetsObj[n].txt.length}`).join('\n') || 'У користувача ще немає текстових шаблонів...',
        maxBlocks: allBlockLimitsObj.text,
        maxNameLng: allValuesLimit.textName,
        maxContentLng: allValuesLimit.textContent,
      })
    })
    const data = await resp.text();
    textSnippetsAssistantLoader.style.display = 'none';
    sendTextSnippetsPromptBtn.disabled = false;
    return data;
  } catch(e) {
    console.error(e);
    textSnippetsAssistantLoader.style.display = 'none';
    sendTextSnippetsPromptBtn.disabled = false;
  }
}

// Get music assistant resp
async function getMusicAssistantResp() {
  try {
    musicAssistantLoader.style.display = 'block';
    sendMusicPromptBtn.disabled = true;
    const resp = await fetch('https://music-assistant.vengernazar0.workers.dev', {
      method: 'POST',
      headers: {'Content-Type': 'application/json',},
      body: JSON.stringify({
        history: historyForMusicAssistant,
        musicMeta: Object.keys(allMusicObj).map(n => `name: ${n}, music url: ${allMusicObj[n].musicUrl}`).join('\n') || 'У користувача ще немає код-блоків',
        maxBlocks: allBlockLimitsObj.music,
        maxNameLng: allValuesLimit.musicName,
      })
    })
    const data = await resp.text();
    musicAssistantLoader.style.display = 'none';
    sendMusicPromptBtn.disabled = false;
    return data;
  } catch(e) {
    console.error(e);
    musicAssistantLoader.style.display = 'none';
    sendMusicPromptBtn.disabled = false;
  }
}

// Give info for ai
function giveInfoForAi(aiGetter) {
  if(aiGetter.replace(/[^a-z]/ig, '') === 'limits') return `[Відповідь системи на команду get: ?get| limits]:
━━━━━━━━ LIMITS ━━━━━━━━
- Todos ${allBlockLimitsObj.todos} (used ${allTodosObj ? Object.keys(allTodosObj).length : 'Not loaded'})
- Notes ${allBlockLimitsObj.notes} (used ${allNotesObj ? Object.keys(allNotesObj).length : 'Not loaded'})
- Urls ${allBlockLimitsObj.urls} (used ${allUrlsObj ? Object.keys(allUrlsObj).length : 'Not loaded'})
- Code snippets ${allBlockLimitsObj.codes} (used ${allUserCodesObj ? Object.keys(allUserCodesObj).length : 'Not loaded'})
- Text blocks ${allBlockLimitsObj.text} (used ${allTextsSnippetsObj ? Object.keys(allTextsSnippetsObj).length : 'Not loaded'})
- Music ${allBlockLimitsObj.music} (used ${allMusicObj ? Object.keys(allMusicObj).length : 'Not loaded'})
Ліміти на поля:
- Туду - назва: ${allValuesLimit.todoName}, марк: ${allValuesLimit.todoMark}, тег: ${allValuesLimit.todoTag}
- Нотатки - назва: ${allValuesLimit.noteName}, опис: ${allValuesLimit.noteDesc}, контент: 2000 символів
- Посилання - назва(титул): ${allValuesLimit.urlTitle}
- Коди - назва: ${allValuesLimit.codeName}, контент: 1500(без урахування пробілів)
- Текст-блоки - назва: ${allValuesLimit.textName}, контент: ${allValuesLimit.textContent}
- Музика - назва: ${allValuesLimit.musicName}
`;
  else if(aiGetter.replace(/[^a-z]/ig, '') === 'settings') return `[Відповідь системи на команду get: ?get| settings]:
━━━━━━━━ SETTINGS ━━━━━━━━
Тема: ${localStorage.getItem('todo-theme') || 'light'}
Час анімації видалення(в мілісекундах): ${localStorage.getItem('del-anim-time') || '1500'}
Розмір шрифту нотаток(контенту): ${localStorage.getItem('notes-font-size') || 1.2}rem
Виключена анімація видалення: ${localStorage.getItem('disabled-anim') || 'false'}
Підтвердження для видалення: ${localStorage.getItem('conf-before-delete') || 'false'}\n
Мова для мікрофону в асистентів: ${localStorage.getItem('mic-lang') || 'en-US'}
`;
  else if(aiGetter.replace(/[^a-z]/ig, '') === 'actions') return `[Відповідь системи на команду get: ?get| actions]:
━━━━━━━━ ACTIONS ━━━━━━━━
${userActionsForAi.length ? userActionsForAi.join('. ') : 'В данній сесії користувач нічого не робив'}
`;
  else if(aiGetter.replace(/[^a-z]/ig, '') === 'updates') return `[Відповідь системи на команду get: ?get| updates]:\n${updatesList}`;
  else return '';
}

// Set content functions
function setContent(type, name, content) {
  if(!name) { // Create
    if(type === 'todos') {
      const d = new Date();
      const date = d.getDate(),
      month = d.getMonth(),
      year = d.getFullYear();
      const time = `${String(date).padStart(2, '0')}:${String(month + 1).padStart(2, '0')}:${year}`;
      allTodosObj[content.name] = { date: time, isCompleted: !!content.completed, mark: content.mark || '', tag: content.tag, isFav: !!content.isFavorite }
    }
    else if(type === 'notes') { allNotesObj[content.name] = { description: content.desc, txt: content.txt || '', isFav: !!content.isFavorite }; }
    else if(type === 'urls') { allUrlsObj[content.name] = {url: content.url, imgUrl: '/all-imgs/Classic-dashboard-img.webp', imgPath: null} }
    else if(type === 'codes') { allUserCodesObj[content.name] = { code: content.code || '', lang: content.language }; }
    else if(type === 'texts') { allTextsSnippetsObj[content.name] = { txt: content.content, isFav: content.isFavorite }; }
    else if(type === 'music') { allMusicObj[content.name] = { musicUrl: content['music-url'] }; }
  }

  else if(!content || !Object.keys(content).length) { // Delete
    const targetObj = type === 'todos' ? allTodosObj
    : type === 'notes' ? allNotesObj
    : type === 'urls' ? allUrlsObj
    : type === 'codes' ? allUserCodesObj
    : type === 'texts' ? allTextsSnippetsObj
    : allMusicObj;
    delete targetObj[name];
  }

  else { // Edit
    if(type === 'todos') {
      const d = new Date();
      const date = d.getDate(),
      month = d.getMonth(),
      year = d.getFullYear();
      const time = `${String(date).padStart(2, '0')}:${String(month + 1).padStart(2, '0')}:${year}`;
      if('mark' in content) allTodosObj[name].mark = content.mark;
      if('tag' in content) allTodosObj[name].tag = content.tag;
      if('isFavorite' in content) allTodosObj[name].isFav = content.isFavorite;
      if('mark' in content || 'tag' in content) allTodosObj[name].date = time;
      if('completed' in content) allTodosObj[name].isCompleted = content.completed;
      if('name' in content) {
        const initTodoObj = allTodosObj[name];
        delete allTodosObj[name];
        allTodosObj[content.name] = initTodoObj;
      }
    }
    else if(type === 'notes') {
      if('desc' in content) allNotesObj[name].description = content.desc;
      if('txt' in content) allNotesObj[name].txt = content.txt;
      if('isFavorite' in content) allNotesObj[name].isFav = content.isFavorite;
      if('name' in content) {
        const initNote = allNotesObj[name];
        delete allNotesObj[name];
        allNotesObj[content.name] = initNote;
      }
    }
    else if(type === 'urls') {
      if('url' in content) allUrlsObj[name].url = content.url;
      if('favorite' in content) allUrlsObj[name].isFav = content.favorite;
      if('name' in content) {
        const objForEdit = allUrlsObj[name];
        delete allUrlsObj[name];
        allUrlsObj[content.name] = objForEdit;
      }
    }
    else if(type === 'codes') {
      if('code' in content) allUserCodesObj[name].code = content.code;
      if('language' in content) allUserCodesObj[name].lang = content.language;
      if('name'  in content) {
        const initCode = allUserCodesObj[name];
        delete allUserCodesObj[name];
        allUserCodesObj[content.name] = initCode;
      }
    }
    else if(type === 'texts') {
      if('content' in content) allTextsSnippetsObj[name].txt = content.content;
      if('isFavorite' in content) allTextsSnippetsObj[name].isFav = content.isFavorite;
      if('name' in content) {
        const obj = allTextsSnippetsObj[name];
        delete allTextsSnippetsObj[name];
        allTextsSnippetsObj[content.name] = obj;
      }
    }
    else if(type === 'music') {
      if('music-url' in content) allMusicObj[name].musicUrl = content['music-url'];
      if('isFavorite' in content) allMusicObj[name].isFav = content.isFavorite;
      if('name' in content) {
        const objForEdit = allMusicObj[name];
        delete allMusicObj[name];
        allMusicObj[content.name] = objForEdit;
      }
    }
  }
}