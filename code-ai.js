const codeAiWrap = document.querySelector('.code-ai-wrap');
// Open
const openCodeAiBtn = allDashboardItem.querySelector('.open-code-ai-wrap');
openCodeAiBtn.addEventListener('click', () => {
  closeAllWraps();
  codeAiWrap.classList.add('show');

  history.pushState(null, {}, '#codeAi');
})

const codeAiLoader = codeAiWrap.querySelector('span.loader');

const CODE_AI_API = 'https://code-ai.dark-backend.workers.dev';
const codeAiHistory = [];

// Chat
const codeAiChatContainer = codeAiWrap.querySelector('div.chat');
codeAiChatContainer.addEventListener('click', async e => {
  const target = e.target;
  const proposeCodeContainer = target.parentElement;

  if (
    target.tagName === 'BUTTON'
    && (
      target.classList.contains('ok')
      || target.classList.contains('no')
      || target.classList.contains('download')
    )) {
    const name = target.dataset.name;
    const tool_call_id = target.dataset.id;

    const info = codeAiProposedCodesInfo.find(obj => obj.id === tool_call_id);
    const newCode = info.newContent;

    if (target.classList.contains('download')) {
      if (!codeAiFilesHandles) {
        const file = new File(
          [newCode],
          name,
          { type: 'text/plain' }
        );

        const url = URL.createObjectURL(file);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${file.name}__${crypto?.randomUUID() ?? Date.now()}.${info.lang}`;
        a.click();

        URL.revokeObjectURL(url);
      }
      else {
        const handle = codeAiFilesHandles.find(hand => hand.name === name);

        if (!handle) {
          return showResponseFn(`File handle not found: ${name}`);
        }

        const writable = await handle.createWritable();

        try {
          await writable.write(newCode);
          await writable.close();
        } catch (e) {
          await writable.abort();
          throw e;
        }
      }

      codeAiHistory.push({
        role: 'tool',
        tool_call_id,
        content: [{
          type: 'document',
          document: {
            data: codeAiFilesHandles
              ? 'Changes applied to the original file'
              : 'Changes downloaded'
          }
        }]
      });

      proposeCodeContainer.style.border = `2px dashed blue`;

      const identityEditedFileNameIdx = codeAiEditedFilesList.findIndex(({ name: fn }) => fn === name);
      if(identityEditedFileNameIdx !== -1) codeAiEditedFilesList.splice(identityEditedFileNameIdx, 1);

      codeAiEditedFilesList.push({ name, newCode });
    }

    else if (target.classList.contains('ok')) {
      codeAiHistory.push({
        role: 'tool',
        tool_call_id,
        content: [
          {
            type: 'document',
            document: {
              data: 'Changes accepted'
            }
          }
        ]
      })

      allUserCodesObj[name].code = newCode;
      proposeCodeContainer.style.border = `2px dashed green`;

      codeSaveBtn.classList.add('unsaved');
    } else if (target.classList.contains('no')) {
      codeAiHistory.push({
        role: 'tool',
        tool_call_id,
        content: [
          {
            type: 'document',
            document: {
              data: 'Changes rejected'
            }
          }
        ]
      })

      proposeCodeContainer.style.border = `2px dashed red`;
    };

    for (const btn of proposeCodeContainer.querySelectorAll('button[class]')) btn.remove();

    if (!codeAiChatContainer.querySelectorAll('code.proposed-code > button:not(.download)').length) codeAiProposedCodesInfo.length = 0;

    if (!codeAiProposedCodesInfo.length) for (const downloadBtn of codeAiChatContainer.querySelectorAll('code.proposed-code > button.download')) {
      codeAiHistory.push({
        role: 'tool',
        tool_call_id: downloadBtn.dataset.id,
        content: [{
          type: 'document',
          document: { data: `${downloadBtn.dataset.name} not downloaded` }
        }]
      });

      downloadBtn.remove();
    }
  }
})

// User area
const codeAiUserArea = codeAiWrap.querySelector('div.user-area');

const codeAiTskTextarea = codeAiWrap.querySelector('textarea');
codeAiTskTextarea.addEventListener('input', e => {
  const value = codeAiTskTextarea.value.trim();
  if (value.length >= 25_000) codeAiTskTextarea.value = value.slice(0, 25_000);

  codeAiTskTextarea.style.height = '65px';

  const textareaHeight = codeAiTskTextarea.getBoundingClientRect().height;
  const textareaMaxHeight = codeAiTskTextarea.scrollHeight;
  const moreHeight = textareaMaxHeight - textareaHeight;

  const textareaCalcHeight = textareaHeight + moreHeight;

  codeAiTskTextarea.style.height = `${Math.max(textareaCalcHeight + 3, 65)}px`;

  codeAiUserArea.style.height = '125px';
  codeAiUserArea.style.height = `${Math.max(codeAiUserArea.offsetHeight + moreHeight, 125)}px`;
})

const codeAiUploadsContainer = codeAiUserArea.querySelector('div.uploads');
const codeAiUploadsFilesInfoP = codeAiUploadsContainer.querySelector('p');
const codeAiFilesWindow = codeAiUploadsContainer.querySelector('div.files-window');

const codeAiSavedFilesList = codeAiFilesWindow.querySelector('ul');
codeAiSavedFilesList.addEventListener('click', e => {
  const target = e.target;

  if (target.tagName === 'LI') target.classList.toggle('is-selected');

  const files = codeAiFilesHandles ?? codeAiUploadFilesInput.files;
  codeAiUploadsFilesInfoP.textContent = files.length + codeAiSavedFilesList.querySelectorAll('li.is-selected')?.length;
})

const codeAiAllowedFiles = [
  'html', 'css', 'scss', 'sass', 'js', 'jsx', 'ts', 'tsx', 'json', 'json5', 'xml', 'yaml', 'yml', 'toml', 'md', 'sql', 'sh', 'bash', 'zsh', 'ps1', 'py', 'java', 'c', 'h', 'cpp', 'cc', 'cxx', 'hpp', 'cs', 'go', 'rs', 'rb', 'php', 'swift', 'kt', 'kts', 'dart', 'lua', 'r', 'scala', 'ex', 'exs', 'erl', 'fs', 'fsx', 'hs', 'clj'
]
const codeAiUploadFilesInput = codeAiUploadsContainer.querySelector('input[type="file"]');
codeAiUploadFilesInput.addEventListener('click', async e => {
  if (!window.showOpenFilePicker) return;

  e.preventDefault();

  try {
    codeAiFilesHandles = await window.showOpenFilePicker({
      multiple: true
    });

    codeAiUploadsFilesInfoP.textContent =
      codeAiFilesHandles.length +
      codeAiSavedFilesList.querySelectorAll('li.is-selected').length;

    codeAiEditedFilesList.length = 0;
  } catch (e) {
    if (e.name !== 'AbortError') console.error(e);
  }
});

codeAiUploadFilesInput.addEventListener('change', () => {
  if (window.showOpenFilePicker) return;

  const files = codeAiUploadFilesInput.files;

  codeAiUploadsFilesInfoP.textContent =
    files.length +
    codeAiSavedFilesList.querySelectorAll('li.is-selected').length;

  codeAiEditedFilesList.length = 0;
});

const codeAiOpenUploadFilesWindow = codeAiUploadsContainer.querySelector('button.open-files-window');
codeAiOpenUploadFilesWindow.addEventListener('click', async () => {
  if (!allUserCodesObj) {
    codeAiLoader.style.display = 'block';
    allUserCodesObj = await getContent('codes') || {};
    codeAiLoader.style.display = 'none';
  }

  codeAiFilesWindow.classList.toggle('open');

  const selectedFiles = Array.from(codeAiSavedFilesList.querySelectorAll('li.is-selected'))?.map(li => li.dataset.name);

  if (codeAiFilesWindow.classList.contains('open')) codeAiSavedFilesList.innerHTML = Object.keys(allUserCodesObj || {})
    ?.map(codeName => {
      const lang = allUserCodesObj[codeName].lang.toLowerCase();
      return `<li data-name="${codeName}" data-lang="${lang}" class='${selectedFiles.includes(codeName) ? 'is-selected' : ''}'>${codeName}.${lang}</li>`;
    }).join('');

  const files = codeAiFilesHandles ?? codeAiUploadFilesInput.files;
  codeAiUploadsFilesInfoP.textContent = files.length + codeAiSavedFilesList.querySelectorAll('li.is-selected')?.length;
});

codeAiUploadsContainer.querySelector('button.upload-files-btn')
.addEventListener('click', () => codeAiUploadFilesInput.click());

// Send prompt
const codeAiProposedCodesInfo = []
const codeAiEditedFilesList = [];
let codeAiFilesHandles = null;
const codeAiSendPromptBtn = codeAiUserArea.querySelector('button.send');
codeAiSendPromptBtn.addEventListener('click', async () => {
  const userTxt = codeAiTskTextarea.value.trim();
  if (userTxt.length > 25_000) return showResponseFn(`Your message is too long (${userTxt.length}/25_000)`);

  if (codeAiProposedCodesInfo.length && codeAiChatContainer.querySelector('code.proposed-code > button:not(.download)')) return showResponseFn("You still have changes that haven't been reviewed");
  else {
    for (const downloadBtn of codeAiChatContainer.querySelectorAll('code.proposed-code > button.download')) {
      codeAiHistory.push({
        role: 'tool',
        tool_call_id: downloadBtn.dataset.id,
        content: [{
          type: 'document',
          document: { data: `${downloadBtn.dataset.name} not downloaded` }
        }]
      });

      downloadBtn.remove();
    }

    codeAiProposedCodesInfo.length = 0;
  }

  const files = codeAiFilesHandles ? codeAiFilesHandles : codeAiUploadFilesInput.files;
  const uploadsContent = [];

  for (const file of files) {
    const name = file.name;
    const type = name.split('.')[name.split('.').length - 1];
    if (!codeAiAllowedFiles.includes(type)) return showResponseFn(`${type} is not allowed file type`);

    if (uploadsContent.some(file => file.name === name)) return showResponse(`Duplicate names of uploaded files are not allowed (${name})`);

    const text = codeAiFilesHandles
    ? await file.getFile().then(f => f.text())
    : codeAiEditedFilesList.find(({ name: fn }) => fn === name)?.newCode ?? await file.text();
    uploadsContent.push({ name, isSaved: false, content: text ?? '', language: type });
  }

  codeAiLoader.style.display = 'block';

  codeAiTskTextarea.value = '';
  codeAiTskTextarea.style.height = '65px';

  createCodeAiPreInChat(userTxt, 'user');
  codeAiHistory.push({ role: 'user', content: userTxt });

  codeAiChatContainer.scrollTop = codeAiChatContainer.scrollHeight;

  try {
    const AI_answer = await fetch(CODE_AI_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        history: codeAiHistory,
        content: [
          ...uploadsContent,
          ...Array.from(codeAiSavedFilesList.querySelectorAll('li.is-selected'))
            .map(selectedLi => {
              const name = selectedLi.dataset.name;
              return { name, isSaved: true, content: allUserCodesObj[name].code, language: selectedLi.dataset.lang || 'unknown' }
            })
        ],
      })
    }).then(r => r.json());

    const message = AI_answer.message;
    const usedTools = AI_answer.used_tools;

    const editsArr = AI_answer.edits || [];

    createCodeAiPreInChat(
      `${usedTools.length
        ? `<details><summary>Used tools</summary>${usedTools.map(tool => `<p>${tool}</p>`).join('')}</details>`
        : ''
        }
      ${message.for_show}

      ${
        editsArr
          .map(newCodeObj => `
              <code class='proposed-code'>
                <h3>${newCodeObj.name}</h3>
                <pre>${hashHtmlSymbols(newCodeObj.newContent)}</pre>
                ${newCodeObj.isSaved ? `
                  <button class='ok' data-name='${newCodeObj.name}' data-id="${newCodeObj.id}" type='button'>Accept</button>
                  <button class='no' data-name='${newCodeObj.name}' data-id="${newCodeObj.id}" type='button'>Cancel</button>
                ` : `<button class='download' data-name='${newCodeObj.name}' data-id="${newCodeObj.id}" type='button'>Download</button>`
            }
              </code>
            `).join('')
        }
    `.trim(),

      'assistant'
    );

    codeAiHistory.push({ role: 'assistant', content: message.for_history });

    if (editsArr.length) {
      for (const newCodeObj of editsArr) codeAiProposedCodesInfo.push({name: newCodeObj.name, newContent: newCodeObj.newContent, id: newCodeObj.id, lang: newCodeObj.language});

      const pushedToolsId = [];
      const allToolCalls = editsArr.flatMap(({ tool_calls }) => tool_calls);
      codeAiHistory.push({ role: 'assistant', tool_calls: allToolCalls.filter(tool => {
        if(pushedToolsId.includes(tool.id)) return false;
        else {
          pushedToolsId.push(tool.id);
          return true;
        }
      }) });
    }
  } catch (e) {
    console.log(e);
  }
  finally {
    codeAiLoader.style.display = 'none';
  }
})

const codeAiRespAnimationData = {
  interval: null,
  pre: null,
  text: null
}
function createCodeAiPreInChat(message, role) {
  if (codeAiRespAnimationData.interval) {
    clearInterval(codeAiRespAnimationData.interval);
    codeAiRespAnimationData.pre.innerHTML = codeAiRespAnimationData.text;
  };

  const pre = document.createElement('pre');
  codeAiChatContainer.appendChild(pre);

  if (role === 'user') {
    pre.classList.add('user');
    return pre.textContent = message;
  }

  else if (role === 'assistant') {
    pre.classList.add('is-ai-text');
    codeAiRespAnimationData.pre = pre;
    codeAiRespAnimationData.text = message;

    const initTypingText = new DOMParser().parseFromString((unhashHtmlSymbols(message)), "text/html").body.textContent;

    let c = 0;
    codeAiRespAnimationData.interval = setInterval(() => {
      c += Math.floor(Math.random() * 20 + 1);
      codeAiRespAnimationData.pre.textContent = initTypingText.slice(0, c);

      if(c < 25) codeAiChatContainer.scrollTop = codeAiChatContainer.scrollHeight;

      if (c >= initTypingText.length) {
        clearInterval(codeAiRespAnimationData.interval);
        codeAiRespAnimationData.interval = null;
        codeAiRespAnimationData.pre.innerHTML = message;
      }
    }, 20);
  }
}