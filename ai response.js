let historyForAiPrompt = [];
let memoryForAi = '';
async function getAiResponse(txtForPrompt) {
  try {
    assistantLoader.style.display = 'block';
    sendPromptBtn.disabled = true;
    const resp = await fetch('https://throbbing-night-c338.vengernazar0.workers.dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify({
        txt: txtForPrompt || '',
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
async function useAiResp(givenInfo) {
  let respTxt = await getAiResponse(givenInfo);
  const insertCommands = respTxt.match(/(?:\n)\?get\|[^\n]+/gi);
  let txt = '';
  if(insertCommands) {
    for(let comm of new Set(insertCommands)) {
      respTxt = respTxt.replaceAll(comm, '• Reading data...');
      txt += giveInfoForAi(comm.replace('?get|', '').trim());
    }
  }
  createAssistantResponse(respTxt, false, true);
  if(txt) useAiResp(txt);
}

// Get ai translate
async function getAiTranslateResponse(txt) {
  try {
    assistantLoader.style.display = 'block';
    sendPromptBtn.disabled = true;
    const resp = await fetch('https://shrill-breeze-466e.vengernazar0.workers.dev', {
      method: 'POST',
      headers: {'Content-Type': 'application/json',},
      body: JSON.stringify({txt}),
    });
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
        urlsMeta: allUrlsArr.map(o => `name: ${o.title}, url: ${o.url}`).join('\n') || 'У користувача ще немає УРЛІВ',
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

// Give info for ai
function giveInfoForAi(aiGetter) {
  if(aiGetter.replace(/[^a-z]/ig, '') === 'limits') return `[Відповідь системи на вашу команду get: ?get| limits]:
━━━━━━━━ LIMITS ━━━━━━━━
- Todos ${allBlockLimitsObj.todos} (used ${Object.keys(allTodosObj).length})
- Notes ${allBlockLimitsObj.notes} (used ${Object.keys(allNotesObj).length})
- Urls ${allBlockLimitsObj.urls} (used ${allUrlsArr.length})
- Code snippets ${allBlockLimitsObj.codes} (used ${Object.keys(allUserCodesObj).length})
Ліміти на поля:
- Туду - назва: ${allValuesLimit.todoName}, марк: ${allValuesLimit.todoMark}, тег: ${allValuesLimit.todoTag}
- Нотатки - назва: ${allValuesLimit.noteName}, опис: ${allValuesLimit.noteDesc}, контент: 2000 символів
- Посилання - назва(титул): ${allValuesLimit.urlTitle}
- Коди - назва: ${allValuesLimit.codeName}, контент: 1500(без урахування пробілів)
`;
  else if(aiGetter.replace(/[^a-z]/ig, '') === 'settings') return `[Відповідь системи на вашу команду get: ?get| settings]:
━━━━━━━━ SETTINGS ━━━━━━━━
Тема: ${localStorage.getItem('todo-theme') || 'light'}
Час анімації видалення(вказано в мілісекундах): ${localStorage.getItem('del-anim-time') || '1500'}
Розмір шрифту нотаток(самого контенту): ${localStorage.getItem('notes-font-size') || 1.2}rem
Виключена анімація видалення: ${localStorage.getItem('disabled-anim') || 'false'}
Чи включено підтвердження для видалення: ${localStorage.getItem('conf-before-delete') || 'false'}\n
`;
  else if(aiGetter.replace(/[^a-z]/ig, '') === 'actions') return `[Відповідь системи на вашу команду get: ?get| actions]:
━━━━━━━━ ACTIONS ━━━━━━━━
${userActionsForAi.length ? userActionsForAi.join('. ') : 'В данній сесії користувач нічого не робив'}
`;
  else {
    const allAiGettingsWords = aiGetter.split(' ');
    const type = allAiGettingsWords[0];

    const targetTypeEl = type === 'todos'
    ? allTodosObj : type === 'notes' ? allNotesObj
    : type === 'urls' ? allUrlsArr : allUserCodesObj;

    let allTypeInfos = [];
    if(type === 'urls') for(let o of targetTypeEl) allTypeInfos.push({name: o.title, url: o.url.toLowerCase()});
    else if(type === 'todos') for(let n in targetTypeEl) allTypeInfos.push({name: n, mark: allTodosObj[n].mark.toLowerCase(), tag: allTodosObj[n].tag.toLowerCase(), date: allTodosObj[n].date.toLowerCase()});
    else if(type === 'notes') for(let n in allNotesObj) allTypeInfos.push({name: n, description: allNotesObj[n].description.toLowerCase(), contentLength: allNotesObj[n].txt.replaceAll('\n','').length});
    else if(type === 'codes') for(let n in allUserCodesObj) allTypeInfos.push({name: n, language: allUserCodesObj[n].lang.toLowerCase(), contentLength: allUserCodesObj[n].code.replace(/\s/g,'').length});
    // Get all filtered names
    const allNamesArr = aiGetter.includes('name:') ? aiGetter.match(/(?:name:)([^|]+)/i)[1]?.trim().split(', ').map(n => n.toLowerCase()) : allTypeInfos.map(o => o.name.toLowerCase());

    // Get ai number filter
    let num = allAiGettingsWords[1];
    if(isNaN(num)) num = Math.max(...Object.values(allBlockLimitsObj));

    // Array who been gived for ai
    let arrayForGiveInfo = allTypeInfos.filter(o => allNamesArr.find(n => o.name.toLowerCase().includes(n)));

    // Init arrayForGiveInfo for todos
    if(type === 'todos') {
      const allMarks = aiGetter.includes('mark:') ? aiGetter.match(/(?:mark:)([^|]+)/i)[1]?.trim().split(', ').map(m => m.toLowerCase()) : arrayForGiveInfo.map(o => o.mark);
      const allTags = aiGetter.includes('tag:') ? aiGetter.match(/(?:tag:)([^|]+)/i)[1]?.trim().split(', ').map(t => t.toLowerCase()) : arrayForGiveInfo.map(o => o.tag);

      arrayForGiveInfo = arrayForGiveInfo.filter(o => allMarks.find(m => o.mark.includes(m)) && allTags.find(t => o.tag.includes(t)));
    }
    else if(type === 'notes') {
      const allDesc = aiGetter.includes('desc:') ? aiGetter.match(/(?:desc:)([^|]+)/i)[1]?.trim().split(', ').map(d => d.toLowerCase()) : arrayForGiveInfo.map(o => o.description);
      const allContentLngs = aiGetter.includes('length:') ? aiGetter.match(/(?:length:)([^|]+)/i)[1]?.trim().split(', ') : arrayForGiveInfo.map(o => o.contentLength);

      arrayForGiveInfo = arrayForGiveInfo.filter(o => allDesc.find(d => o.description.includes(d)) && allContentLngs.find(l => +l === o.contentLength));
    }
    else if(type === 'urls') {
      const allUrls = aiGetter.includes('url:') ? aiGetter.match(/(?:url:)([^|]+)/i)[1]?.trim().split(', ').map(u => u.toLowerCase()) : arrayForGiveInfo.map(o => o.url);

      arrayForGiveInfo = arrayForGiveInfo.filter(o => allUrls.find(u => o.url.includes(u)));
    }
    else if(type === 'codes') {
      const allLangs = aiGetter.includes('lang:') ? aiGetter.match(/(?:lang:)([^|]+)/i)[1]?.trim().split(', ').map(l => l.toLowerCase()) : arrayForGiveInfo.map(o => o.language);
      const allContentLngs = aiGetter.includes('length:') ? aiGetter.match(/(?:length:)([^|]+)/i)[1]?.trim().split(', ') : arrayForGiveInfo.map(o => o.contentLength);

      arrayForGiveInfo = arrayForGiveInfo.filter(o => allLangs.find(l => o.language.includes(l)) && allContentLngs.find(l => +l === o.contentLength));
    }
    else return '';

    return `[Відповідь системи на вашу команду get: ?get| ${aiGetter}]:
━━━━━━━━ ${aiGetter} ━━━━━━━━
${arrayForGiveInfo.slice(0, num).join('\n').trim() || 'У користувача ще немає елементів'}
`;
  };
}

// Set content functions
function setContent(type, name, content) {
  if(type !== 'urls') { // NO URLS(URLS IS ARRAY)
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
      else if(type === 'codes') { allUserCodesObj[content.name] = { code: content.code || '', lock: !!content.lock, lang: content.language }; }
    }

    else if(!Object.keys(content).length) { // Delete
      const targetObj = type === 'todos' ? allTodosObj : type === 'notes' ? allNotesObj : allUserCodesObj;
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
      else if(type === 'codes') {
        if('lock' in content) allUserCodesObj[name].lock = content.lock;
        if('code' in content) allUserCodesObj[name].code = content.code;
        if('language' in content) allUserCodesObj[name].lang = content.language;
        if('name'  in content) {
          const initCode = allUserCodesObj[name];
          delete allUserCodesObj[name];
          allUserCodesObj[content.name] = initCode;
        }
      }
    }
  }

  else { // URLS
    if(!name) { // Create
      allUrlsArr.push({title: content.name, url: content.url, imgUrl: '/all-imgs/Classic-dashboard-img.webp', imgPath: null, isFav: content.favorite || false});
    }
    else if(!Object.keys(content).length) allUrlsArr = allUrlsArr.filter(o => o.title !== name); // Delete
    else {  // Edit
      const initUrlObj = allUrlsArr.find(o => o.title === name);
      if(!initUrlObj) return createTodosAssistantResponse(`URL ${name} not found`);
      if('name' in content) initUrlObj.title = content.name;
      if('url' in content) initUrlObj.url = content.url;
      if('favorite' in content) initUrlObj.isFav = content.favorite;
    }
  }
}