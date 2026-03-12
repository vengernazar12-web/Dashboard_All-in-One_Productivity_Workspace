let historyForAiPrompt = [];
let memoryForAi = '';
async function getAiResponse(txtForPrompt, isTranslate = false) {
  try {
    assistantLoader.style.display = 'block';
    sendPromptBtn.disabled = true;
    const resp = await fetch('https://throbbing-night-c338.vengernazar0.workers.dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify({
        txt: txtForPrompt || '',
        isTranslate: isTranslate,
        history: historyForAiPrompt,
        memoryForAi,
      })
    })
    assistantLoader.style.display = 'none';
    sendPromptBtn.disabled = false;

    const data = await resp.json();
    console.log(data);
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
      txt += giveInfoForAi(comm.replace('?get|', '').trim(), true);
    }
  }
  createAssistantResponse(respTxt, false, true);
  if(txt) useAiResp(txt);
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
    // Ai use filter?
    const aiGetterUseFilter = /name:|mark:|tag:|desc:|url:|lang:|length:/i.test(aiGetter);

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

      // If ai use filters, give contents
      if(aiGetterUseFilter) for(let o of arrayForGiveInfo) o.content = allNotesObj[o.name].txt.replaceAll('\n',' ').trim();
    }
    else if(type === 'urls') {
      const allUrls = aiGetter.includes('url:') ? aiGetter.match(/(?:url:)([^|]+)/i)[1]?.trim().split(', ').map(u => u.toLowerCase()) : arrayForGiveInfo.map(o => o.url);

      arrayForGiveInfo = arrayForGiveInfo.filter(o => allUrls.find(u => o.url.includes(u)));
    }
    else if(type === 'codes') {
      const allLangs = aiGetter.includes('lang:') ? aiGetter.match(/(?:lang:)([^|]+)/i)[1]?.trim().split(', ').map(l => l.toLowerCase()) : arrayForGiveInfo.map(o => o.language);
      const allContentLngs = aiGetter.includes('length:') ? aiGetter.match(/(?:length:)([^|]+)/i)[1]?.trim().split(', ') : arrayForGiveInfo.map(o => o.contentLength);

      arrayForGiveInfo = arrayForGiveInfo.filter(o => allLangs.find(l => o.language.includes(l)) && allContentLngs.find(l => +l === o.contentLength));

      // If ai use filters, give contents
      if(aiGetterUseFilter) for(let o of arrayForGiveInfo) o.content = allUserCodesObj[o.name].code.replaceAll('\n', ' ').replace(/ {2,}/g, ' ').trim();
    }

    return arrayForGiveInfo.length ? `[Відповідь системи на вашу команду get: ?get| ${aiGetter}]:
━━━━━━━━ ${aiGetter} ━━━━━━━━
${JSON.stringify(arrayForGiveInfo.slice(0, num), null, 2)}
` : '';
  };
}