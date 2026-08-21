let historyForAiPrompt = null;
let generatedCommandsCount = 0;

let runnerCallCounter = 0;

let isSlowAnswerTimer = null;
async function getAiResponse() {
  clearTimeout(isSlowAnswerTimer);
  isSlowAnswerTimer = !isLastBeenThinking ? setTimeout(() => createAssistantResponse("Thinking... <span>analyzing request</span>", true), 2000) : null;

  try {
    assistantLoader.style.display = 'block';
    sendPromptBtn.disabled = true;

    const resp = await fetch('https://throbbing-night-c338.dark-backend.workers.dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', "Authorization": userId},
      body: JSON.stringify({
        history: historyForAiPrompt,
        limits: { blocks: allBlockLimitsObj, values: allValuesLimit }
      })
    })

    const data = await resp.json();
    clearTimeout(isSlowAnswerTimer);

    // If ai do tool_calls
    if ('tool_calls' in data) {
      let generatedCommands = [];
      historyForAiPrompt.push({role: "assistant", content: '', tool_calls: data.tool_calls});

      for (let tool of data.tool_calls) {
        const func = tool.function;
        const name = func.name;
        const args = JSON.parse(func.arguments);
        const id = tool.id;

        if (name === 'go_runner') {
          let command = args.command;

          let count = 0;
          const matched = command?.match(/{|}/g);
          if(matched) for(let symbol of matched) symbol === '{' ? count++ : count--;

          if(count > 0) command = `${command}${'}'.repeat(count)}`;
          else if(count < 0) command = `${'{'.repeat(Math.abs(count))}${command}`;
          generatedCommands.push({
            for_show: `
<div class="runner-command-block">
  <div class="command">${hashHtmlSymbols(command)}</div>
  <button class="cancel-command-btn" data-tool-id="${id}">NO</button>
  <button class="runner-command-btn" data-tool-id="${id}" data-command='${hashHtmlSymbols(command)}'>RUN</button>
</div>
`,          for_runner: command,
            tool_id: id
}
          );
        }
      }

      if (generatedCommands.length) {
        runnerCallCounter++;

        const checkCommands = [];
        for(let commandObj of generatedCommands) {
          if(!isJson5Loaded) {
            await loadScript("https://unpkg.com/json5/dist/index.min.js");
            isJson5Loaded = true;
          }

          const serverValidate = await goRunner(commandObj.for_runner);
          checkCommands.push({validate: serverValidate, tool_id: commandObj.tool_id});
        }

        // Is found error
        if(checkCommands.find(obj => obj.validate.result?.errors?.length)) {
          for(let command of checkCommands) {
            command.validate.success = [];
            historyForAiPrompt.push({ role: 'tool', tool_call_id: command.tool_id, content: JSON.stringify(command.validate)});
          }

          return runnerCallCounter <= 3 ? getAiResponse() : 'Runner error...';
        }

        runnerCallCounter = 0;

        generatedCommandsCount = generatedCommands.length;
        assistantLoader.style.display = 'none';
        return generatedCommands.map(obj => obj.for_show).join('');
      };

      return '';
    }
    else historyForAiPrompt.push({ role: 'assistant', content: data.for_history});

    // Save history
    try {
      await fetch(HISTORY_WORKER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', "Authorization": userId },
        body: JSON.stringify({ history: historyForAiPrompt })
      });
    } catch {};

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