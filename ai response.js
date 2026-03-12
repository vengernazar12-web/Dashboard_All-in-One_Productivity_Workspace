let historyForAiPrompt = [];
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