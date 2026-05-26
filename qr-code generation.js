const qrCodeGenerationWrap = document.querySelector('.qr-code-generation-wrap');
// Open
const openQrCodeGenerationBtn = allDashboardItem.querySelector('.open-qr-code-generation-wrap');
openQrCodeGenerationBtn.addEventListener('click', () => {
  closeAllWraps();
  qrCodeGenerationWrap.classList.add('show');
});

const generateQrCodeLoader = qrCodeGenerationWrap.querySelector('.loader');

const generatedQrCodePreview = qrCodeGenerationWrap.querySelector('img');
const downloadGeneratedQrCodeA = qrCodeGenerationWrap.querySelector('a');

const userContentForQrCodeGenerate = qrCodeGenerationWrap.querySelector('textarea');
userContentForQrCodeGenerate.addEventListener('input', () => userContentForQrCodeGenerate.style.color = userContentForQrCodeGenerate.value.trim().length <= 2500 ? 'var(--text-color)' : 'red');

const sendContentForQrCodeGenerateBtn = qrCodeGenerationWrap.querySelector('button');
sendContentForQrCodeGenerateBtn.addEventListener('click', async () => {
  const content = userContentForQrCodeGenerate.value.trim();

  if(!content) return;
  if(content.length > 2500) return showResponseFn(`Your content is too long (${content.length}/2000)`);

  sendContentForQrCodeGenerateBtn.disabled = true;
  generateQrCodeLoader.style.display = 'block';

  const resp = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=200&data=${encodeURIComponent(content)}`);

  const ok = resp.ok;

  const blob = ok ? await resp.blob() : await resp.text();
  const url = ok ? URL.createObjectURL(blob) : blob;

  if(ok) {
    generatedQrCodePreview.src = url;
    downloadGeneratedQrCodeA.href = url;
  } else showResponseFn(`Something went wrong... Error! ${url}`);

  sendContentForQrCodeGenerateBtn.disabled = false;
  generateQrCodeLoader.style.display = 'none';
})