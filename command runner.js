// Set preloader text
whatIsLoadingText.textContent = 'Loading command runner...';

const commandRunnerWrap = document.querySelector('.commands-runner-wrap');
// Open
const openCommandRunnerWrapBtn = allDashboardItem.querySelector('.open-commands-runner-wrap');
openCommandRunnerWrapBtn.addEventListener('click', async () => {
  closeAllWraps();

  if(!codeMirrorLoaded) {
    showPreloader();
    preloaderProgress.max = 2;
    preloaderProgress.value = 0;
    whatIsLoadingText.textContent = 'Start loading code editor...';

    await loadCodemirror();

    showPreloader(false);
    preloaderProgress.value = 1;
  }

  commandRunnerWrap.classList.add('show');

  if (!runCommandCodemirrorEditor) {
    showPreloader();
    preloaderProgress.max = 2;
    preloaderProgress.value = 1;
    whatIsLoadingText.textContent = 'Start loading syntax highlight...';

    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.15/addon/mode/simple.js");

    CodeMirror.defineSimpleMode("runner", {
      start: [
        { regex: /"(create|delete|check|find)"/, token: "keyword" },
        { regex: /"(target|action|from|where)"/, token: "property" },

        { regex: /"(?:[^\\]|\\.)*?"/, token: "string" },
        { regex: /'(?:[^\\]|\\.)*?'/, token: "string" },

        { regex: /\b\d+\b/, token: "number" },
      ]
    });

    runCommandCodemirrorEditor = CodeMirror.fromTextArea(commandRunnerWrap.querySelector('.user-run-command-textarea'), editorOptions);
    runCommandCodemirrorEditor.setOption('mode', "runner");

    runCommandCodemirrorEditor.setValue('\n');
    runCommandCodemirrorEditor.refresh();

    preloaderProgress.value = 2;
    whatIsLoadingText.textContent = 'Loaded';
    setTimeout(() => showPreloader(false), 500);
  }
});

const runCommandLoader = commandRunnerWrap.querySelector('.run-command-loader');

// Run command
let runCommandCodemirrorEditor = null;

const runCommandResultBlock = commandRunnerWrap.querySelector('.run-command-result-block');

const runCommandBtn = commandRunnerWrap.querySelector('.run-command-btn');
runCommandBtn.addEventListener('click', async () => {
  const command = runCommandCodemirrorEditor.getValue().trim();
  if(!command) return;
    runCommandBtn.disabled = true;
    runCommandLoader.style.display = 'block';
    runCommandResultBlock.textContent = '';

    const serverCommandValidationData = await goRunner(command);

    let resultTxt = '';

    const success = serverCommandValidationData.result.success;
    resultTxt = `${success?.length ? '→ ' : ''}${success?.join('\n→ ')}`;
    const errors = serverCommandValidationData.result.errors;
    if (errors?.length) resultTxt += `\n\n<span>Errors</span>\n✕ ${errors?.map(obj => `${obj.error}: ${obj.need}`).join('\n✕ ')}`;

    runCommandResultBlock.innerHTML = resultTxt;

    // Do actions (create/delete)
    const doActions = serverCommandValidationData.result.do_action || [];

    doRunnerActions(doActions);

    runCommandBtn.disabled = false;
    runCommandLoader.style.display = 'none';
})

async function goRunner(command) {
  try {
    let allCommandsArr = JSON.parse("[" + command + "]");
    if (Array.isArray(allCommandsArr[0])) allCommandsArr = allCommandsArr[0];
    const allTypes = new Set(allCommandsArr.map(obj => obj.target));

    if (!allTypes.size) return;

    let allData = {};

    // Get all obj data
    for (let type of allTypes) {
      if (type === 'todos') {
        if (!allTodosObj) allTodosObj = await getContent(type);
        if (!allTodosObj) throw new Error('Server error... Please try again later...');
        allData[type] = allTodosObj;
      }
      else if (type === 'notes') {
        if (!allNotesObj) allNotesObj = await getContent(type);
        if (!allNotesObj) throw new Error('Server error... Please try again later...');
        allData[type] = allNotesObj;
      }
      else if (type === 'urls') {
        if (!allUrlsObj) allUrlsObj = await getContent(type);
        if (!allUrlsObj) throw new Error('Server error... Please try again later...');
        allData[type] = allUrlsObj;
      }
      else if (type === 'codes') {
        if (!allUserCodesObj) allUserCodesObj = await getContent(type);
        if (!allUserCodesObj) throw new Error('Server error... Please try again later...');
        allData[type] = allUserCodesObj;
      }
      else if (type === 'texts') {
        if (!allTextsSnippetsObj) allTextsSnippetsObj = await getContent(type);
        if (!allTextsSnippetsObj) throw new Error('Server error... Please try again later...');
        allData[type] = allTextsSnippetsObj;
      }
      else if (type === 'music') {
        if (!allMusicObj) allMusicObj = await getContent(type);
        if (!allMusicObj) throw new Error('Server error... Please try again later...');
        allData[type] = allMusicObj;
      }
    }

    // Fetch commands result
    const serverCommandValidationResponse = await fetch('https://run-command-validation.vengernazar0.workers.dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify({
        allCommandsArr: allCommandsArr,
        allData: allData,
      })
    });
    const serverCommandValidationData = await serverCommandValidationResponse.json();

    return serverCommandValidationData;
  } catch (e) {
    console.error(e);
    runCommandBtn.disabled = false;
    runCommandLoader.style.display = 'none';
    return {result: {error: e.message, need: "Use JSON syntax"}};
  }
}

// Do runner actions fn
function doRunnerActions(doActions) {
  const contentObjs = { 'todos': allTodosObj, 'notes': allNotesObj, 'urls': allUrlsObj, 'codes': allUserCodesObj, 'texts': allTextsSnippetsObj, 'music': allMusicObj, }
  const contentSaveBns = { 'todos': todoSaveBtn, 'notes': noteSaveBtn, 'urls': urlSaveBtn, 'codes': codeSaveBtn, 'texts': textSaveBtn, 'music': musicSaveBtn, }

  for (let actionObj of doActions) {
      const target = actionObj.target;
      const action = actionObj.action;
      const name = actionObj.name;
      const fields = actionObj.fields;

      if (action === 'create') contentObjs[target][name] = fields;
      else if (action === 'delete') delete contentObjs[target][name];

      contentSaveBns[target].classList.add('unsaved');
    }
}

// Set preloader value
preloaderProgress.value = 13;