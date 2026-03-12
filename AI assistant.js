// Set preloader text
whatIsLoadingText.textContent = 'Loading assistant logic...';

// Saved data for undo
let savedDataForUndo = {};

// User actions
const userActionsForAi = [];

function writeToUserActions(val) {
  const d = new Date();
  const day = d.getDate();
  const hour = d.getHours();
  const minutes = d.getMinutes();
  const seconds = d.getSeconds();

  userActionsForAi.push(`${val} дня ${String(day).padStart(2, '0')} та час ${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
  if(userActionsForAi.length > 25) userActionsForAi.shift();
}

// Assistant wrap
const assistantWrap = document.querySelector('.assistant-wrap');
assistantWrap.addEventListener('click', e => {
  const target = e.target;
  if( // Close assistant block for show blocks
    !target.classList.contains('send-prompt-btn')
    && assistantBlockForShowBlocks.classList.contains('open')
    && !target.closest('.assistant-found-elements-block')
    && target.dataset.type !== 'show'
  ) assistantBlockForShowBlocks.classList.remove('open');
})
// Open
allDashboardItem.querySelector('.open-assistant-wrap')
.addEventListener('click', () => {
  closeAllWraps();
  assistantWrap.classList.add('show');
  userPromptTextarea.focus();
});

// Assistant memory
let assistantTypeMemory = null;
const assistantMemoryTxtInfo = assistantWrap.querySelector('.assistant-memory-txt-info');

// Assistant loader
const assistantLoader = assistantWrap.querySelector('.assistant-loader');

// Operations
const allPromptOperation = [
'add', 'create', 'додай', 'створи', 'додати', 'створити',
'delete', 'remove', 'видалити', 'видали', 'забрати', 'забери', 'відхилити', 'віхили',
'search', 'find', 'знайти', 'знайди', 'пошук',
'clear', 'очистити', 'очистка', 'очисти',
'save', 'зберегти', 'збережи',
'list', 'show', 'покажи', 'показати', 'список', 'виведи',
'read', 'reading', 'info', 'check', 'checking', 'читати', 'прочитай', 'інфо', 'інформація', 'перевірити', 'перевір',
'calculator', 'calc', 'calculate', 'калькулятор', 'посчитай', 'посчитати',
'open', 'відкрити', 'відкрий', 'відчини', 'зайти', 'зайди',
'розкажи', 'tell', "об'ясни", 'explain', 'як', 'how', 'set', 'change', 'сет', 'встав', 'постав', 'зміни', 'редагуй', 'update', 'онови', 'replace',
];
const allReadingOp = ['read', 'reading', 'info', 'check', 'checking', 'читати', 'прочитай', 'інфо', 'інформація',];
const allCalcOp = ['calculator', 'calc', 'calculate', 'калькулятор', 'посчитай', 'посчитати',];
const allAddingOp = ['add', 'create', 'додай', 'створи', 'додати', 'створити',];
const allDeletingOp = ['delete', 'remove', 'видалити', 'видали', 'забрати', 'забери', 'відхилити', 'віхили',];
const allSearchingOp = ['search', 'find', 'знайти', 'знайди', 'пошук',];
const allClearingOp = ['clear', 'очистити', 'очистка', 'очисти'];
const allSavingOp = ['save', 'зберегти', 'збережи',];
const allShowingOp = ['list', 'show', 'покажи', 'показати', 'список', 'виведи',];
const allOpeningOp = ['open', 'відкрити', 'відкрий', 'відчини', 'зайти', 'зайди',];

const allOperationForUseAi = ['розкажи', 'tell', "об'ясни", 'explain', 'як', 'how', 'set', 'change', 'сет', 'встав', 'постав', 'зміни', 'редагуй', 'update', 'онови', 'replace',];

// Types
const allPromptTypes = [
'todo', 'todos', 'туду', 'тудушка', 'тудушку', 'тудушки', 'завдання',
'note', 'notes', 'нотатка', 'нотатку', 'нотатки',
'url', 'urls', 'link', 'links', 'силка', 'силки', 'силку', 'урли', 'посилання',
'code', 'codes', 'код', 'коди', 'кодів',
'weather', 'погода', 'погоду',
'timezone', 'zone', 'час', 'година', 'часовий', 'пояс', 'часові', 'пояси', 'таймзони',
'exchange', 'rate', 'обмін', 'валюта', 'валюти', 'курси',
'settings', 'налаштування', 'настройки',
'timer', 'таймер',
'profile', 'stats', 'account', 'профіль', 'статистика', 'аккаунт',
];
const allTodoTypes = ['todo', 'todos', 'туду', 'тудушка', 'тудушку', 'тудушки', 'завдання',];
const allNoteTypes = ['note', 'notes', 'нотатка', 'нотатку', 'нотатки',];
const allUrlTypes = ['url', 'urls', 'link', 'links', 'силка', 'силки', 'силку', 'урли', 'посилання',];
const allCodeTypes = ['code', 'codes', 'код', 'коди', 'кодів',];
const allWeatherTypes = ['weather', 'погода', 'погоду',];
const allTimezoneTypes = ['timezone', 'zone', 'час', 'година', 'часовий', 'пояс', 'часові', 'пояси', 'таймзони',];
const allExchangeRateTypes = ['exchange', 'rate', 'обмін', 'валюта', 'валюти', 'курси',];
const allSettingsTypes = ['settings', 'налаштування', 'настройки',];
const allTimersTypes = ['timer', 'таймер',];
const allProfilesTypes = ['profile', 'stats', 'account', 'профіль', 'статистика', 'аккаунт',]

const allPromptWords = [...allPromptOperation, ...allPromptTypes];

const allPromptOpsWhoNeedAnyField = [...allAddingOp, ...allDeletingOp, ...allSearchingOp];

// Assistant found block
const assistantBlockForShowBlocks = assistantWrap.querySelector('.assistant-found-elements-block');
assistantBlockForShowBlocks.addEventListener('click', e => {
  if(e.target.classList.contains('close-assistant-found-block-btn')) assistantBlockForShowBlocks.classList.remove('open');
})

// Assistant response container
const assistantResponseContainer = assistantWrap.querySelector('.assistant-answer-container');
assistantResponseContainer.addEventListener('click', e => {
  if(e.target.tagName === 'SPAN') {
    let text = e.target.textContent;
    if(text.startsWith('-')) text = text.slice(1);
    if(text.endsWith(':')) text = text.slice(0, -1);
    showResponseFn(text);
  }
  else if(e.target.dataset.type === 'show') {
    const allAdded = e.target.dataset.value.split(/\s*,\s*/).filter(n => n.trim());
    const wrapType = e.target.dataset.wrapType;

    assistantBlockForShowBlocks.textContent = '';
    const frag = document.createDocumentFragment();

    for(let n of allAdded) frag.appendChild(createBlockForAssistantShow(n, wrapType));

    frag.appendChild(createAssistantShowBlokCloseBtn());
    assistantBlockForShowBlocks.appendChild(frag);

    assistantBlockForShowBlocks.classList.add('open');
  }
  else if(e.target.dataset.type === 'undo') {
    const wrapType = e.target.dataset.wrapType;
    const undoOp = e.target.dataset.undoOperation;
    if(undoOp === 'clear') {
      createAssistantResponse('Undo clear');

      if(wrapType === 'todo') {
        allTodosObj = savedDataForUndo.todo;
        initGroupsTodosObj();
      }
      else if(wrapType === 'note') allNotesObj = savedDataForUndo.note;
      else if(wrapType === 'url') allUrlsArr = savedDataForUndo.url;
      else if(wrapType === 'code') allUserCodesObj = savedDataForUndo.code;
    }
    else if(undoOp === 'delete') {
      createAssistantResponse('Undo delete');

      if(wrapType === 'todo') {
        for(let n in savedDataForUndo.todo) allTodosObj[n] = savedDataForUndo.todo[n];
        initGroupsTodosObj();
      }
      else if(wrapType === 'note') for(let n in savedDataForUndo.note) allNotesObj[n] = savedDataForUndo.note[n];
      else if(wrapType === 'url') for(let o of savedDataForUndo.url) allUrlsArr.push(o);
      else if(wrapType === 'code') for(let n in savedDataForUndo.code) allUserCodesObj[n] = savedDataForUndo.code[n];
    }

    setOpenBtnsTexts();
  }
})

// User prompt textarea
const userPromptTextarea = assistantWrap.querySelector('.user-prompt-textarea');
const allCalcSymbols = '+-/*.';
userPromptTextarea.addEventListener('beforeinput', e => {
  const value = userPromptTextarea.value.trim()
  if(!value.includes('calc')) return;

  const lastLetter = value[value.length - 1];

  const userLetter = e.data;

  if(allCalcSymbols.includes(userLetter) && allCalcSymbols.includes(lastLetter)) return e.preventDefault();
})
userPromptTextarea.addEventListener('input', () => {
  userPromptTextarea.style.height = '30px';
  userPromptTextarea.style.height = `${userPromptTextarea.scrollHeight + 3}px`;

  sendPromptBtn.style.border = `1px solid ${userPromptTextarea.value.length > 1000 ? 'red' : 'silver'}`
})

// Send prompt
const sendPromptBtn = assistantWrap.querySelector('.send-prompt-btn');
sendPromptBtn.addEventListener('click', async () => {
  const originVal = initUserPromptValue(userPromptTextarea.value);
  if(!originVal) return showResponseFn('Nothing to send');
  if(userPromptTextarea.value.length > 1000) return showResponseFn('Your question is too long (more than 1000 characters)');

  // Generate user text
  const userTaskDiv = document.createElement('div');
  const userTaskPre = document.createElement('pre');
  userTaskDiv.classList.add('user-text');
  userTaskPre.textContent = userPromptTextarea.value;
  userTaskDiv.appendChild(userTaskPre);
  assistantResponseContainer.appendChild(userTaskDiv);
  assistantResponseContainer.scrollTop = assistantResponseContainer.scrollHeight;
  // ------------

  const val = originVal.toLowerCase().replaceAll('\n', ' ').replace(/ {2,}/g, ' ');

  historyForAiPrompt.push({role: 'user', content: [{type: 'text', text: val}]});
  if(historyForAiPrompt.length > 9) historyForAiPrompt.shift();

  userPromptTextarea.value = '';
  userPromptTextarea.style.height = '30px';

  // Use ai if user value includes '?'
  if(originVal.includes('?')) return useAiResp();

  let operation = null;
  let type = null;

  const matchedTxt = (val.match(/^.+[:=]?/) || [''])[0].replace(/[^a-z0-9а-яіїєґ\s]/ig, '');

  for(let word of matchedTxt.split(/ +/)) {
    if(operation && type) break;
    if(allPromptOperation.includes(word)) operation = word;
    if(allPromptTypes.includes(word)) type = word;
  }

  if(!operation) operation = searchCorrectPromptWord(val, allPromptOperation);
  if(!type) type = searchCorrectPromptWord(val, allPromptTypes);
  if(!type) type = assistantTypeMemory;

  // Calculator command
  if(allCalcOp.includes(operation)) {
    const userTasks = val.match(/[\d/*+\s.()-]+/g);
    if(!userTasks) return createAssistantResponse("You asked me to calculate something, but I don't understand what.");

    let totalResponseText = 'Answers:\n';
    const cleanTasks = userTasks.filter(t => /\d/.test(t)).map(t => {
      let res = t.trim();
      if(!/^\d|^\(/.test(res)) res = res.slice(1);
      if(!/\d$|\)$/.test(res)) res = res.slice(0, -1);
      return res.trim().replaceAll(' ','');
    })
    for(let task of cleanTasks) {
      try{
        const answer = Function(`return ${task}`)();
        totalResponseText += `${task} = ${answer}\n`;
      } catch { totalResponseText += 'Invalid expression\n'; }
    }

    createAssistantResponse(totalResponseText);
    setPreInnerHTMLRegexp(...cleanTasks);
    return;
  }

  const isOpenOrShowOp = allShowingOp.includes(operation) || allOpeningOp.includes(operation);

  // Weater command
  if(allWeatherTypes.includes(type) && isOpenOrShowOp) {
    let point = matchAllItems(val, '', 'points');

    if(point) {
      const pointInMap = cityCountryMap[point];
      if(!/^[a-z\s]+$/i.test(point)) {
        if(!pointInMap) point = await getAiResponse(point, true);
        else point = pointInMap;
      };
      searchCityInput.value = point;
      renderFoundCities(point);
    }

    assistantWrap.classList.remove('show');
    weatherWrap.classList.add('show');
    searchCityWindow.classList.add('open');
    return;
  }

  // Timezone command
  if(allTimezoneTypes.includes(type) && isOpenOrShowOp) {
    let point = matchAllItems(val, '', 'points');
    if(!timezonesArr.length) await initAllTimezones();

    if(point) {
      const pointInMap = cityCountryMap[point];
      if(!/^[a-z\s]+$/i.test(point)) {
        if(!pointInMap) point = await getAiResponse(point, true);
        else point = pointInMap;
      };

      searchTimezonesInput.value = point;
      renderFoundTimezones(point.toLowerCase());
    }

    assistantWrap.classList.remove('show');
    timezoneWrap.classList.add('show');
    return;
  }

  // Exhcnage rate command
  if(allExchangeRateTypes.includes(type) && isOpenOrShowOp) {
    assistantWrap.classList.remove('show');
    openExchangeRateWrapBtn.click();
  }

  // Open settings command
  if(allSettingsTypes.includes(type)) {
    if(isOpenOrShowOp) {
      assistantWrap.classList.remove('show');
      openSettingsWindow.click();
    } else useAiResp();
    return;
  }

  // Open timer command
  if(allTimersTypes.includes(type)) {
    if(isOpenOrShowOp) {
      assistantWrap.classList.remove('show');
      openTimerBtn.click();
    } else useAiResp();
    return;
  }

  // Open profile command
  if(allProfilesTypes.includes(type)) {
    if(isOpenOrShowOp) {
      assistantWrap.classList.remove('show');
      openProfileWrapBtn.click();
    } else useAiResp();
    return;
  }

  // Use AI
  if(
    !type
    || !operation
    || (allPromptOpsWhoNeedAnyField.includes(operation) && !val.match(/name|key|mark|tag|desc|lang/i) && val.match(/url/ig)?.length < 1)
    || allOperationForUseAi.includes(operation) || matchedTxt.split(' ').find(w => allOperationForUseAi.includes(w))
  ) return useAiResp();
  // Use AI

  // Start
  if(allTodoTypes.includes(type)) readTodoResp(originVal, operation);
  else if(allNoteTypes.includes(type)) readNoteResp(originVal, operation);
  else if(allUrlTypes.includes(type)) readUrlResp(originVal, operation);
  else if(allCodeTypes.includes(type)) readCodeResp(originVal, operation);
  else useAiResp();
})

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

// Set code/note content
function setContent(allSetArr) {
  const found = [];
  const notFound = [];

  for(let obj of allSetArr) {
    if(obj.type === 'notes') {
      if(allNotesObj[obj.name]) {
        allNotesObj[obj.name].txt = obj.content;
        found.push(obj.name);
      } else notFound.push(obj.name);
    }

    else if(obj.type === 'codes') {
      if(allUserCodesObj[obj.name]) {
        allUserCodesObj[obj.name].code = obj.content;
        found.push(obj.name);
      } else notFound.push(obj.name);
    }
  }

  if(!found.length) return createAssistantResponse('All the names you specified were not found');
  if(!notFound.length) return createAssistantResponse("Content changed");

  createAssistantResponse(`Content changed in the blocks: ${found.join(', ')}`);
}

// Check values length fn
function checkValuesLength(values, type, checkLimitItem = null) {
  // Check values length
  if(checkLimitItem) {
    for(let v of values) if(v.replace(/\* *\d+ *$/, '').length > allValuesLimit[checkLimitItem]) return `The ${v}  exceeds the maximum length of ${allValuesLimit[checkLimitItem]} characters.`;
  }

  // Check blocks length
  if(values.length > 9) {
    return `You have ${values.length} ${type}, but max limit 9, i create only 9 ${type}.`;
  }
  let initLng = values.length;
  for(let n of values) {
    const parsedNLng = +(n.match(/\*\d+$/) || [''])[0].replace('*', '');
    if(parsedNLng > (parsedNLng + initLng)) {
      return `The length limit in your request has been exceeded. I create only 9 ${type}.`;
    }
    initLng += parsedNLng;
  }
}

// Create assistant response
let typingInterval = null;

let initTypingElement = null;
let initTypingText = null;

let preInnerHTMLRegexp = null;
function setPreInnerHTMLRegexp(...arr) { preInnerHTMLRegexp = new RegExp(arr.map(s => s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'), 'ig'); }

let isCodeNamesInfo = false;
let isGeneratedText = false;

function initTypingIntervals(pre, resp, txtLng) {
  let c = 0;
  typingInterval = setInterval(() => {
    c += Math.floor(Math.random() * 3 + 1);
    pre.textContent = resp.slice(0, c);
    assistantResponseContainer.scrollTop = assistantResponseContainer.scrollHeight;
    if(c > txtLng) {
      clearInterval(typingInterval);
      if(isGeneratedText) pre.textContent = `${resp}`;
      else pre.innerHTML = resp.replace(preInnerHTMLRegexp, '<span>$&</span>');
      typingInterval = null;
    };
  }, 30);
}

function createAssistantResponse(resp, needBtn = false, isGenText = false) {
  if(typingInterval) {
    clearInterval(typingInterval);

    if(isGeneratedText) initTypingElement.textContent = initTypingText;
    else initTypingElement.innerHTML = initTypingText.replace(preInnerHTMLRegexp, '<span>$&</span>');

    assistantResponseContainer.scrollTop = assistantResponseContainer.scrollHeight;

    typingInterval = null;
    isCodeNamesInfo = false;
  };

  const div = document.createElement('div');
  const pre = document.createElement('pre');

  div.classList.add('assistant-text');
  pre.textContent = '';

  div.appendChild(pre);
  assistantResponseContainer.appendChild(div);

  initTypingElement = pre;
  initTypingText = resp
  isGeneratedText = isGenText;

  const txtLng = initTypingText.length;

  initTypingIntervals(initTypingElement, initTypingText, txtLng);

  historyForAiPrompt.push({role: "assistant", content: [{type: 'text', text: initTypingText.replaceAll('\n', ' ').replace(/ {2,}/g, ' ')}]});
  if(historyForAiPrompt.length > 9) historyForAiPrompt.shift();

  if(needBtn) {
    const btn = document.createElement('button');
    div.appendChild(btn);
    return btn;
  }
}

// Search types/operation
function searchCorrectPromptWord(val, arr) {
  let allUserWords = val.replace(/[^a-z0-9а-яіїєґ\s]/ig, '').split(/\s+/).filter(w => w.length > 1);
  if(!allUserWords.join('').trim()) return null;
  allUserWords = allUserWords.filter(w => !allPromptWords.includes(w));

  for(let word of arr) {
    for(let userWord of allUserWords) {
      if(userWord.startsWith(word) || userWord.endsWith(word)) return word;
    };
  }
  return null;
}

// Parse values
function parseValues(values) {
  let result = [];
  for(let i = 0; i < values.length; i++) {
    if(/\* *\d+ *$/.test(values[i])) {
      const num = +values[i].match(/\d+ *$/)[0];
      const cleanValue = values[i].replace(/\* *\d+ *$/, '');
      for(let j = 0; j < (num > 9 ? 9 : num); j++) result.push(cleanValue);
    }
    else result.push(values[i]);
  }
  return result.map(n => n.trim());
}

// Match all items
function matchAllItems(value, type, item) {
  if(item === 'names') {
    const match = value.match(
      /names?\s*(:+|=+)?\s*(.+?)(?=,*\s*(tags?|marks?|lang(uage)?s?|urls?|links?|desc(ription)?s?)\s*(:+|=+)?|$)/i
    );
    return match ? match[2].trim() : '';
  }
  if(item === 'keys') return (value.match(/keys?\s*(:+|=+)?\s*.+/) || [''])[0].trim().replace(/keys?\s*(:+|=+)?\s*/, '').split(/\s*,\s*/);

  // Todo
  if(type === 'todo') {
    if(item === 'marks') return (value.match(/marks?\s*(:+|=+)?\s*.+?(?=,*\s*names?\s*(:+|=+)?|,*\s*tags?\s*(:+|=+)?|,*\s*$)/i) || [''])[0].trim().replace(/marks?\s*(:+|=+)?\s*/i, '').split(/\s*,\s*/);
    if(item === 'tags') return (value.match(/tags?\s*(:+|=+)?\s*.+?(?=,*\s*names?\s*|,*\s*marks?\s*(:+|=+)?|,*\s*$)/i) || [''])[0].trim().replace(/tags?\s*(:+|=+)?\s*/i, '').split(/\s*,\s*/);
  }

  // Note
  if(type === 'note') {
    if(item === 'desc') return (value.match(/desc(ription)?s?\s*(:+|=+)?\s*(.+?)(?=,*\s*names?\s*(:+|=+)?|,*\s*$)/i) || [''])[3].trim().split(/\s*,\s*/);
  }

  // Url
  if(type === 'url') {
    if(item === 'urls') {
      const match = value.match(/(\s|^)(urls?|links?)\s*(:+|=+)?\s*.+?(?=,*\s*(names?\s*(:+|=+)?|(urls?|links)\s*(:+|=+)?|$))/gi);
      if(!match || match.length < 2) return [''];
      return match[match.length - 1].trim().replace(/(\s|^)(urls?|links?)\s*(:+|=+)?\s*/i, '').split(/\s*,\s*/);
    };
  }

  // Code
  if(type === 'code') {
    if(item === 'langs') return (value.match(/lang(uage)?s?\s*(:+|=+)?\s*.+?(?=,*\s*names?\s*(:+|=+)?|,*\s*$)/i) || [''])[0].replace(/lang(uage)?s?\s*(:+|=+)?\s*/i, '').split(/\s*,\s*/);
  }

  // Weather/timezones points
  if(item === 'points')
    return (value.match(/(points?|city|cities|country|countries)\s*(:+|=+)?\s*([^,]+)/i) || [''])[3]?.trim().replace(/(points?|city|country)\s*(:+|=+)?\s*/i, '').replace(/[^a-zа-яіїєґ\s]/ig, '');
}

// Init show added block in types fn
function initShowAddedInType(type, button, allAdded) {
  button.dataset.type = 'show';
  button.dataset.value = allAdded;
  button.dataset.wrapType = type;
  button.textContent = 'Show added';
}

// Init undo btn
function initUndoBtn(wrapType, btn, op) {
  btn.textContent = 'Undo';
  btn.dataset.type = 'undo';
  btn.dataset.wrapType = wrapType;
  btn.dataset.undoOperation = op;

  // Hide undo btns
  for(let b of assistantResponseContainer.querySelectorAll('.assistant-text > button[data-type="undo"]')) {
    if(b.dataset.wrapType === wrapType && b.dataset.undoOperation !== op) b.style.display = 'none';
  }
}

// Create block for show
function createBlockForAssistantShow(n, type, searchVal = null) {
  let safeKey = null, regexp = null;
  if(searchVal) {
    safeKey = searchVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    regexp = new RegExp(safeKey, 'gi');
  }

  if(type === 'todo') {
    const div = document.createElement('div'),
    h4 = document.createElement('h4'),
    p = document.createElement('p'),
    span = document.createElement('span');

    if(searchVal) {
      h4.innerHTML = n.replace(regexp, '<mark>$&</mark>');
      p.innerHTML = allTodosObj[n].date.replace(regexp, '<mark>$&</mark>');
      span.innerHTML = allTodosObj[n].mark.replace(regexp, '<mark>$&</mark>');
    } else {
      h4.textContent = n;
      p.textContent = allTodosObj[n].date;
      span.textContent = allTodosObj[n].mark;
    }

    h4.classList.add('found-todo-h4');
    p.classList.add('found-todo-p');
    span.classList.add('found-todo-span');

    div.append(h4, p, span);
    return div;
  }
  else if(type === 'note') {
    const div = document.createElement('div'),
    h4 = document.createElement('h4'),
    hr = document.createElement('hr'),
    p = document.createElement('p');

    if(searchVal) {
      h4.innerHTML = n.replace(regexp, '<mark>$&</mark>');
      p.innerHTML = allNotesObj[n].description.replace(regexp, '<mark>$&</mark>');
    } else {
      h4.textContent = n;
      p.textContent = allNotesObj[n].description;
    }

    div.append(h4, hr, p);
    return div;
  }
  else if(type === 'url') {
    const div = document.createElement('div'),
    img = document.createElement('img'),
    p = document.createElement('p'),
    a = document.createElement('a');

    const foundUrlObj = allUrlsArr.find(o => o.title === n);

    if(searchVal) {
      p.innerHTML = foundUrlObj?.url.replace(regexp, '<mark>$&</mark>');
      a.innerHTML = foundUrlObj?.title.replace(regexp, '<mark>$&</mark>');
    } else {
      p.innerHTML = foundUrlObj?.url;
      a.innerHTML = foundUrlObj?.title;
    }

    img.classList.add('found-url-img');
    img.src = foundUrlObj?.imgUrl || '/all-imgs/Classic-dashboard-img.webp';

    p.classList.add('found-url-p');

    a.classList.add('found-url-a');
    a.href = foundUrlObj?.url;
    a.setAttribute('target', '_blank');

    div.append(img, p, a);
    return div;
  }
  else if(type === 'code') {
    const div = document.createElement('div'),
    h4 = document.createElement('h4'),
    hr = document.createElement('hr'),
    p = document.createElement('p');

    if(searchVal) {
      h4.innerHTML = n.replace(regexp, '<mark>$&</mark>');
      if(allUserCodesObj[n].lang.toLowerCase() !== 'html') p.innerHTML = allUserCodesObj[n].code.replace(regexp, '<mark>$&</mark>') || '...';
      else p.textContent = allUserCodesObj[n].code || '...';
    } else {
      h4.textContent = n;
      p.textContent = allUserCodesObj[n].code || '...';
    };

    div.append(h4, hr, p);
    return div;
  }
}

// Create close assistant show block btn
function createAssistantShowBlokCloseBtn() {
  const closeBlockBtn = document.createElement('button');
  closeBlockBtn.classList.add('close-assistant-found-block-btn');
  closeBlockBtn.textContent = '❌';
  return closeBlockBtn;
}

// Init/parse user value
function initUserPromptValue(val) {
  const result = val.trim()
  .replace(/\s+(та\s*|з\s*|ще\s*|і\s*)*(назвами?|назвою|назв(а|и)|ім'я|іменами|імена)\s*(:+|=+)?/i, ' names:')
  .replace(/\s+(та\s*|з\s*|ще\s*|і\s*)*(марками?|марком|марки?)\s*(:+|=+)?/i, ' marks:')
  .replace(/\s+(та\s*|з\s*|ще\s*|і\s*)*(тегами|тегом|теги?)\s*(:+|=+)?/i, ' tags:')
  .replace(/\s+(та\s*|з\s*|ще\s*|і\s*)*(описами?|описом|описи?)\s*(:+|=+)?/i, ' descs:')
  .replace(/\s+(та\s*|з\s*|ще\s*|і\s*)*(мовами|мовою|мов(а|и))\s*(:+|=+)?/i, ' langs:')
  .replace(/(ключиками|ключами?|ключем|ключ(і|у)?)\s*(:+|=+)?/i, ' keys:')
  .replace(/(міст(о|а|і)|країн(а|и|і)|точк(а|и)|точці)\s*(:+|=+)?/i, ' point:')

  .replace(/(?:and\s+|with\s+)+(keys?|names?|marks?|tags?|descs?|langs?|urls?|points?|cities?|countries?)\s*(:+|=+)?/gi, ' $1:');

  return replaceLast(result, new RegExp('\s+(та\s*|з\s*|ще\s*|і\s*)*(посиланн?ями?|посиланн?я|посилань|силками?|силк(а|и)|силкою|урлом|урл(ами?)?)\s*(:+|=+)?', 'gi'), ' urls $3 ');
}

// Reverse last word
function replaceLast(str, search, replace) {
  return str.split(' ').reverse().join(' ').replace(search, replace).split(' ').reverse().join(' ');
}

// Dashboard docs
const assistantDocsWindow = assistantWrap.querySelector('.dashboard-docs');
// Open
assistantWrap.querySelector('.open-dashboard-docs')
.addEventListener('click', () => assistantDocsWindow.classList.add('show'));
// Close
assistantDocsWindow.querySelector('.close-dashboard-docs')
.addEventListener('click', () => assistantDocsWindow.classList.remove('show'));

// Set preloader value
preloaderProgress.value = 11;