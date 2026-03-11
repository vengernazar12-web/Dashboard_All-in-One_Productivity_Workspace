let historyForAiPrompt = [];
async function getAiResponse(prompt, isTranslate = false, isGetter = false) {
  try {
    assistantLoader.style.display = 'block';
    sendPromptBtn.disabled = true;
    const resp = await fetch('https://throbbing-night-c338.vengernazar0.workers.dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify({
        prompt: [...historyForAiPrompt].reverse().find(t => t.startsWith('User: '))?.replace('User: ', '') || '(system response), continue',
        giveInfo: isGetter ? `━━ SYSTEM RESPONSE ━━\n${prompt}` : '',
        isTranslate: isTranslate,
        history: historyForAiPrompt.join('\n'),
      })
    })
    assistantLoader.style.display = 'none';
    sendPromptBtn.disabled = false;

    const data = await resp.json();
    console.log(data);
    return data.txt;
  } catch {
    assistantLoader.style.display = 'none';
    sendPromptBtn.disabled = false;
    return "?| Sorry, something went wrong...";
  }
}