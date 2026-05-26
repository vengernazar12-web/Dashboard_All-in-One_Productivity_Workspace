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

    const resp = await fetch('https://throbbing-night-c338.vengernazar0.workers.dev', {
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
      for (let tool of data.tool_calls) {
        historyForAiPrompt.push({type: "function_call", call_id: tool.call_id, name: tool.name, arguments: tool.arguments});

        if (tool.name === 'go_runner') {
          let command = JSON.parse(tool.arguments).command;

          let count = 0;
          const matched = command?.match(/{|}/g);
          if(matched) for(let symbol of matched) symbol === '{' ? count++ : count--;

          if(count > 0) command = `${command}${'}'.repeat(count)}`;
          else if(count < 0) command = `${'{'.repeat(Math.abs(count))}${command}`;
          generatedCommands.push({
            for_show: `
<div class="runner-command-block">
  <div class="command">${hashHtmlSymbols(command)}</div>
  <button class="cancel-command-btn" data-tool-id="${tool.call_id}">NO</button>
  <button class="runner-command-btn" data-tool-id="${tool.call_id}" data-command='${hashHtmlSymbols(command)}'>RUN</button>
</div>
`,          for_runner: command,
            tool_id: tool.call_id
}
          );
        }
      }

      if (generatedCommands.length) {
        runnerCallCounter++;

        const checkCommands = [];
        for(let commandObj of generatedCommands) {
          const serverValidate = await goRunner(commandObj.for_runner);
          checkCommands.push({validate: serverValidate, tool_id: commandObj.tool_id});
        }

        // Is found error
        if(checkCommands.find(obj => obj.validate.result.errors.length)) {
          for(let command of checkCommands) {
            command.validate.success = [];
            historyForAiPrompt.push({type: "function_call_output", call_id: command.tool_id, output: JSON.stringify(command.validate)});
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