const GENERATE_IMAGE_API = 'https://image-generation.vengernazar0.workers.dev?';

const generateImageWrap = document.querySelector('.image-ai-generator-wrap');
// Open
const opeGenerateImgWrapBtn = allDashboardItem.querySelector('.open-generate-img-wrap');
opeGenerateImgWrapBtn.addEventListener('click', () => {
  closeAllWraps();
  if(needPushState) history.pushState({}, null, '#image-generation');
  generateImageWrap.classList.add('show');
});

const imageGenerateLoader = generateImageWrap.querySelector('.loader');

const generatedImgPreview = generateImageWrap.querySelector('.image-preview');

const promptForGenerateImgInput = generateImageWrap.querySelector('.prompt-for-generate-image-input');
promptForGenerateImgInput.addEventListener('input', () => {
  const promptLng = promptForGenerateImgInput.value.trim().length;

  promptForGenerateImgInput.style.color = promptLng <= 100 ? 'var(--text-color)' : 'red';
});

const downloadGeneratedImgA = generateImageWrap.querySelector('.download-generated-image-a');

const sendPromptForGenerateImgBtn = generateImageWrap.querySelector('.send-prompt-for-generate-image-btn');
sendPromptForGenerateImgBtn.addEventListener('click', async () => {
  const value = promptForGenerateImgInput.value.trim();
  if(!value) return;
  if(value.length > 100) return showResponseFn(`Message is too long (${value.length}/100)`);

  imageGenerateLoader.style.display = 'block';
  sendPromptForGenerateImgBtn.disabled = true;

  const generatedImgUrlResp = await fetch(`${GENERATE_IMAGE_API}req=${encodeURIComponent(value)}&userId=${userId}`);

  const ok = generatedImgUrlResp.ok;

  const blob = ok ? await generatedImgUrlResp.blob() : await generatedImgUrlResp.text();
  const generatedImgUrl = ok ? URL.createObjectURL(blob) : blob;

  promptForGenerateImgInput.value = '';

  if(ok) {
    generatedImgPreview.src = generatedImgUrl;
    downloadGeneratedImgA.href = generatedImgUrl
  } else generatedImgPreview.src = `./all-imgs/generate image errors/${generatedImgUrl}.png`;

  imageGenerateLoader.style.display = 'none';
  sendPromptForGenerateImgBtn.disabled = false;
})