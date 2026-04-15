let historyForAiPrompt = [];
let memoryForAi = '';
let generatedCommandsCount = 0;

let isSlowAnswerTimer = null;
async function getAiResponse() {
  clearTimeout(isSlowAnswerTimer);
  isSlowAnswerTimer = !isLastBeenThinking ? setTimeout(() => createAssistantResponse("Thinking... <span>analyzing request</span>", true), 2000) : null;

  // History validate
  let fourUserMsgIdx = null;
  let userMsgCount = 0;

  // Stay 5 role: 'user'
  for (let i = historyForAiPrompt.length - 1; i > 0; i--) {
    if (historyForAiPrompt[i].role === 'user') {
      if (userMsgCount === 4) {
        fourUserMsgIdx = i;
        break;
      } else userMsgCount++;
    }
  }
  if (fourUserMsgIdx) historyForAiPrompt = historyForAiPrompt.slice(fourUserMsgIdx);

  try {
    assistantLoader.style.display = 'block';
    sendPromptBtn.disabled = true;

    const resp = await fetch('https://throbbing-night-c338.vengernazar0.workers.dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify({
        history: historyForAiPrompt,
        memoryForAi,
      })
    })

    const data = await resp.json();
    clearTimeout(isSlowAnswerTimer);

    // If ai do tool_calls
    if ('tool_calls' in data) {
      historyForAiPrompt.push({ role: 'assistant', tool_calls: data.tool_calls });

      const info = [];
      let generatedCommands = [];
      for (let tool of data.tool_calls) {
        if (tool.function.name === 'get_info') {
          const getter = JSON.parse(tool.function.arguments).getter;
          info.push({ id: tool.id, arg: getter, function_name: 'get_info' });
        }
        if (tool.function.name === 'go_runner') {
          let command = JSON.parse(tool.function.arguments).command;

          let count = 0;
          const matched = command.match(/{|}/g);
          if(matched) for(let symbol of matched) symbol === '{' ? count++ : count--;

          if(count > 0) command = `${command}${'}'.repeat(count)}`;
          else if(count < 0) command = `${'{'.repeat(Math.abs(count))}${command}`;
          generatedCommands.push({
            for_show: `
<div class="runner-command-block">
  <div class="command">${hashHtmlSymbols(command)}</div>
  <button class="cancel-command-btn" data-tool-id="${tool.id}">NO</button>
  <button class="runner-command-btn" data-tool-id="${tool.id}" data-command='${hashHtmlSymbols(command)}'>RUN</button>
</div>
`,          for_runner: command,
            tool_id: tool.id
}
          );
        }
      }

      // Show ai tool plan
      if (info.length) {
        createAssistantResponse(hashHtmlSymbols(data.tool_plan), true);

        const getInfoResp = await fetch('https://get-content-for-ai-tool.vengernazar0.workers.dev', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', },
          body: JSON.stringify({
            assistant_tool_calls: info,
            allBlockLimitsObj,
            allValuesLimit
          })
        });
        const getInfoData = await getInfoResp.json();

        // Push to history
        for (let tool of getInfoData) historyForAiPrompt.push(tool);
      }
      if (generatedCommands.length) {
        const checkCommands = [];
        for(let commandObj of generatedCommands) {
          const serverValidate = await goRunner(commandObj.for_runner);
          checkCommands.push({validate: serverValidate, tool_id: commandObj.tool_id});
        }

        // Is found error
        if(checkCommands.find(obj => obj.validate.result.errors.length)) {
          for(let command of checkCommands) {
            command.validate.success = [];
            historyForAiPrompt.push({role: "tool", tool_call_id: command.tool_id, content: JSON.stringify(command.validate)});
          }
          return getAiResponse();
        }

        generatedCommandsCount = generatedCommands.length;
        assistantLoader.style.display = 'none';
        return generatedCommands.map(obj => obj.for_show).join('');
      };

      return getAiResponse();
    }
    else historyForAiPrompt.push({ role: 'assistant', content: data.for_history});

    assistantLoader.style.display = 'none';
    sendPromptBtn.disabled = false;

    return data.txt;
  } catch (e) {
    clearTimeout(isSlowAnswerTimer);
    console.error(e);
    assistantLoader.style.display = 'none';
    sendPromptBtn.disabled = false;
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
        maxContentLng: allValuesLimit.notesContent,
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
        maxContentLng: `${allValuesLimit.codeContent} символів(без урахування пробілів/пропусків)`,
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