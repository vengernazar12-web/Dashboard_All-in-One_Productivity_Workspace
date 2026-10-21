const ideaGeneratorWrap = document.querySelector('.idea-generator-wrap');
// Open
const openIdeaGeneratorBtn = allDashboardItem.querySelector('.open-idea-generator-wrap');
openIdeaGeneratorBtn.addEventListener('click', () => {
  closeAllWraps();
  ideaGeneratorWrap.classList.add('show');

  history.pushState({}, null, '#ideaGenerator');
});

const ideaGeneratorLoader = ideaGeneratorWrap.querySelector('.loader');

const ideaGeneratorResultWrap = ideaGeneratorWrap.querySelector('div');
const ideaGeneratorTextarea = ideaGeneratorWrap.querySelector('textarea');

const ideaGeneratorSendBtn = ideaGeneratorWrap.querySelector('button.send');
ideaGeneratorSendBtn.addEventListener('click', async () => {
  const value = ideaGeneratorTextarea.value.trim();
  if (value.length > 2000) return showResponseFn('Your text is too long (>2000)');

  ideaGeneratorResultWrap.textContent = '';
  ideaGeneratorTextarea.disabled = true;
  ideaGeneratorSendBtn.disabled = true;
  ideaGeneratorLoader.style.display = 'block';

  try {
    const aiAnswer = await fetch('https://gemma-4-31b-1.dark-backend.workers.dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ req: value })
    }).then(r => r.text());

    ideaGeneratorResultWrap.innerHTML = aiAnswer;
  } catch (e) {
    ideaGeneratorResultWrap.textContent = e.message;
  } finally {
    ideaGeneratorTextarea.disabled = false;
    ideaGeneratorSendBtn.disabled = false;
    ideaGeneratorLoader.style.display = 'none';
  }
})

// Copy
ideaGeneratorWrap.querySelector('button.copy')
.addEventListener('click', () => {
  const txt = ideaGeneratorResultWrap.textContent.trim();
  if(!txt) return showResponseFn('No results...');
  navigator.clipboard.writeText(txt);
  showResponseFn('Copied');
});