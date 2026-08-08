const allowedFilesForFilesInfo = new Set([
  'html',
  'css',
  'scss',
  'sass',
  'js',
  'jsx',
  'ts',
  'tsx'
]);

const filesInfoWrap = document.querySelector('.files-info-wrap');
// Open
const openFilesInfoBtn = allDashboardItem.querySelector('.open-files-info-wrap');
openFilesInfoBtn.addEventListener('click', () => {
  closeAllWraps();
  filesInfoWrap.classList.add('show');

  history.pushState(null, {}, '#file-lines-counter');
});

const filesInfoInput = filesInfoWrap.querySelector('input[type="file"]');
filesInfoInput.addEventListener('change', async () => {
  const files = [...filesInfoInput.files];
  const typeLinesCounter = {};
  const typeFilesCounter = {};

  const typeFilesSize = {};
  let allSize = 0;

  for (const file of files) {
    const type = file.name.split('.')[file.name.split('.').length - 1];
    if (!allowedFilesForFilesInfo.has(type)) continue;

    typeFilesCounter[type] = (typeFilesCounter[type] || 0) + 1;

    typeFilesSize[type] = (typeFilesSize[type] || 0) + file.size;
    allSize += file.size;

    const text = await file.text();
    const lines = text
      .trim()
      .replace(/\/\/.+|{? *\/\*[\s\S]+?\*\/ *}?/g, '')
      .split(/\n+/)
      .filter(l => l.trim())
      .length;

    typeLinesCounter[type] = (typeLinesCounter[type] || 0) + lines;
  }

  filesInfoTable.innerHTML = `
    <thead>
      <tr>
        <th>Type</th>
        <th>Files</th>
        <th>Size</th>
        <th>Lines</th>
      </tr>
    </thead>
  `;
  const frag = document.createDocumentFragment();
  let allLines = 0;

  for (const type in typeLinesCounter) {
    const lines = typeLinesCounter[type];
    allLines += lines;

    const tr = document.createElement('tr'),
      tdType = document.createElement('td'),
      tdFiles = document.createElement('td'),
      tdSize = document.createElement('td'),
      tdLines = document.createElement('td');

    const size = typeFilesSize[type];

    tdType.textContent = type;
    tdFiles.textContent = typeFilesCounter[type];
    tdSize.textContent = size < 1024 ? `${size.toFixed(2)} B`
      : size > 1024 * 1024 ? `${(size / 1024 / 1024).toFixed(2)} MB`
        : `${(size / 1024).toFixed(2)} KB`;
    tdLines.textContent = lines;

    tr.append(tdType, tdFiles, tdSize, tdLines);

    frag.appendChild(tr);
  }

  const tbody = document.createElement('tbody');
  tbody.appendChild(frag);

  const tfoot = document.createElement('tfoot');
  tfoot.innerHTML = `
    <tr>
      <td>Total</td>
      <td>${files.length}</td>
      <td>${allSize < 1024 ? `${allSize.toFixed(2)} B`
      : allSize > 1024 * 1024 ? `${(allSize / 1024 / 1024).toFixed(2)} MB`
        : `${(allSize / 1024).toFixed(2)} KB`
    }</td>
      <td>${allLines}</td>
    </tr>
  `;

  filesInfoTable.append(tbody, tfoot);
})

const filesInfoTable = filesInfoWrap.querySelector('table');