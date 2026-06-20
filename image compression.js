const imageCompressWrap = document.querySelector('.image-compressor-wrap');
// Open
const openImageCompressBtn = allDashboardItem.querySelector('.open-image-compressor-wrap');
openImageCompressBtn.addEventListener('click', async () => {
  closeAllWraps();
  history.pushState({}, null, '#compress-image');

  if (!imgCompressLoaded) {
    showPreloader();
    whatIsLoadingText.textContent = 'Loading module...';
    preloaderProgress.max = 1;
    preloaderProgress.value = 0;

    await loadScript('https://cdn.jsdelivr.net/npm/browser-image-compression@2.0.2/dist/browser-image-compression.js');
    imgCompressLoaded = true;

    preloaderProgress.value = 1;
    setTimeout(() => showPreloader(false), 500);
  }

  imageCompressWrap.classList.add('show');
})

const imageCompressLoader = imageCompressWrap.querySelector('.loader');

const imageCompressUserFiles = imageCompressWrap.querySelector('input.imgs');
const imageCompressSelectedType = imageCompressWrap.querySelector('select');
const imageCompressImgsResultCont = imageCompressWrap.querySelector('div.result');
const imageCompressInfoPre = imageCompressWrap.querySelector('pre.info');

const imageCompressBtn = imageCompressWrap.querySelector('button');
imageCompressBtn.addEventListener('click', async () => {
  const allowedImgs = ["image/jpeg", "image/png", "image/webp"];

  let userFiles = [...imageCompressUserFiles.files];
  if (!userFiles.length) return;
  if (userFiles.find(f => !allowedImgs.includes(f.type))) return showResponseFn(`Only allowed images types: ${allowedImgs.join(', ')}`);

  userFiles = await Promise.all( userFiles.map(getImageMeta) );

  const selectedType = imageCompressSelectedType.value;

  imageCompressLoader.style.display = 'block';
  imageCompressBtn.disabled = true;

  try {
    for (const generatedImgBlock of imageCompressImgsResultCont.children) URL.revokeObjectURL(generatedImgBlock.querySelector('a')?.href);
    imageCompressImgsResultCont.textContent = '';
    imageCompressInfoPre.textContent = '';

    const compressFiles = [...await Promise.all(
      userFiles.map(({ file, maxSide }) =>
        imageCompression(file, {
          ...compressImgOptions,
          fileType: selectedType || 'image/webp',
          maxWidthOrHeight: Math.min(maxSide, 1500),
          maxSizeMB: +(file.size / 1024 / 1024 / 4).toFixed(5) || 0.0001
        })
      )
    )]

    imageCompressImgsResultCont.innerHTML = compressFiles.map(file => {
      const url = URL.createObjectURL(file);
      return `
<div>
  <img src='${url}'>
  <p>${(file.size / 1024 / 1024).toFixed(2)} MB</p>
  <a href='${url}' download='DASHBOARD_COMPRESSED_IMAGE'>DOWNLOAD</a>
</div>
`;
    }).join('');

    imageCompressInfoPre.textContent = userFiles
      .map(({ size }, i) => {
        const compressed = compressFiles[i].size;
        const saved = (100 - compressed / size * 100).toFixed(1);

        return `${i + 1}. ${(size / 1024 / 1024).toFixed(2)} MB → ${(compressed / 1024 / 1024).toFixed(2)} MB (${saved}% saved)`;
      })
      .join('\n');
  } catch (e) { showResponseFn(`Error: ${e.message}`); console.error(e); }
  finally {
    imageCompressLoader.style.display = 'none';
    imageCompressBtn.disabled = false;
  }
})

async function getImageMeta(file) {
  const bitmap = await createImageBitmap(file);

  return {
    file,
    width: bitmap.width,
    height: bitmap.height,
    maxSide: Math.max(bitmap.width, bitmap.height),
    size: file.size
  };
}