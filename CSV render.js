const csvRenderWrap = document.querySelector('.csv-render-wrap');
// Open
const openCsvRenderBtn = allDashboardItem.querySelector('.open-csv-render-wrap');
openCsvRenderBtn.addEventListener('click', () => {
  closeAllWraps();
  history.pushState({}, null, '#csv');
  csvRenderWrap.classList.add('show');
})

const csvRenderTextarea = csvRenderWrap.querySelector('textarea');
const csvRenderSelectSeparator = csvRenderWrap.querySelector('select.separator');

const csvRenderSelectSortType = csvRenderWrap.querySelector('select.sort-type');
csvRenderSelectSortType.addEventListener('change', () => csvRenderDoSortFn());

const csvRenderResultCont = csvRenderWrap.querySelector('div');
csvRenderResultCont.addEventListener('click', e => {
  const target = e.target;

  if(target.tagName === 'TD') {
    const val = target.textContent;
    navigator.clipboard.writeText(val);
    showResponseFn(`${val} - copied!`);
  } else if(target.tagName === 'TH') {
    if(target.classList.contains('active')) return;

    sortByCountChild = target.cellIndex + 1;;

    csvRenderDoSortFn();
    showResponseFn(`Sorting by ${target.textContent}`);
  }
});

let csvRenderCachedOriginalTableHtml = null;
const csvRenderBtn = csvRenderWrap.querySelector('button.render');
csvRenderBtn.addEventListener('click', () => {
  const value = csvRenderTextarea.value.trim().replaceAll('\r', '');
  if(!value) return;

  let sep = csvRenderSelectSeparator.value || ',';

  if(sep === 'auto') {
    sep = [...csvRenderSelectSeparator.children]
    .slice(1)
    .sort((a, b) => value.split(b.textContent).length - value.split(a.textContent).length)
    [0].textContent;

    showResponseFn(`Auto separate: ${sep}`);
  }

  const lines = value.split('\n').map(l => l.split(sep));

  const maxCols = Math.max(...lines.map(arr => arr.length));

  let html = `
<thead>
  <tr>
    ${lines[0].map((v, i) => `<th colspan='${i !== lines[0].length - 1 ? 1 : maxCols - lines[0].length + 1}'>${hashHtmlSymbols(v.trim())}</th>`).join('')}
  </tr>
</thead>

<tbody>
`.trim();

  const linesForRender = lines.slice(1);
  for(const line of linesForRender) {
    html += `
<tr>
  ${line.map((v, i) => `<td colspan='${i !== line.length - 1 ? 1 : maxCols - line.length + 1}'>${hashHtmlSymbols(v.trim())}</td>`).join('')}
</tr>
`.trim();
  }

  html += `
</tbody>

<tfoot>
  <tr>
    <td>Columns</td>
    <td colspan='${maxCols - 1}'>${maxCols}</td>
  </tr>
  <tr>
    <td>Rows</td>
    <td colspan='${maxCols - 1}'>${lines.length}</td>
  </tr>
</tfoot>
`.trim();

  csvRenderCachedOriginalTableHtml = html;

  csvRenderResultCont.innerHTML = `<table>${html}</table>`;

  if(csvRenderSelectSortType.value !== 'original') csvRenderDoSortFn();
  else {
    csvRenderResultCont.querySelector('th.active')?.classList.remove('active');
    csvRenderResultCont.querySelector(`th:nth-child(${sortByCountChild})`)?.classList.add('active');
  }
});

const csvRenderCopyBtn = csvRenderWrap.querySelector('button.copy');
csvRenderCopyBtn.addEventListener('click', () => {
  if(csvRenderResultCont.childElementCount) {
    navigator.clipboard.writeText(csvRenderResultCont.innerHTML);
    showResponseFn('Copied (HTML)');
  }
})

let sortByCountChild = 1;
function csvRenderDoSortFn() {
  const type = csvRenderSelectSortType.value || 'original';

  if (type === 'original' && csvRenderCachedOriginalTableHtml) csvRenderResultCont.firstElementChild.innerHTML = csvRenderCachedOriginalTableHtml;
  else if (type === 'A → Z | 0 → 9') {
    if (!csvRenderResultCont.childElementCount) return;

    const tbody = csvRenderResultCont.querySelector('tbody');
    const sorted = [...tbody?.querySelectorAll('tr')].sort((a, b) =>
      a.querySelector(`td:nth-child(${sortByCountChild})`).textContent.localeCompare(
        b.querySelector(`td:nth-child(${sortByCountChild})`).textContent,
        undefined,
        { numeric: true }
      )
    );

    for(const row of sorted) tbody.appendChild(row);
  }

  else if(type === 'Z → A | 9 → 0') {
    if (!csvRenderResultCont.childElementCount) return;

    const tbody = csvRenderResultCont.querySelector('tbody');
    const sorted = [...tbody?.querySelectorAll('tr')].sort((a, b) =>
      b.querySelector(`td:nth-child(${sortByCountChild})`).textContent.localeCompare(
        a.querySelector(`td:nth-child(${sortByCountChild})`).textContent,
        undefined,
        { numeric: true }
      )
    );

    for(const row of sorted) tbody.appendChild(row);
  }

  csvRenderResultCont.querySelector('th.active')?.classList.remove('active');
  csvRenderResultCont.querySelector(`th:nth-child(${sortByCountChild})`)?.classList.add('active');
}