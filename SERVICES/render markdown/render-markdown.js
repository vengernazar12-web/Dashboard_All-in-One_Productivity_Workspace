const markdownRender = document.querySelector('div.markdown-render-wrap');
// Open
const openMarkdownRenderBtn = allDashboardItem.querySelector('button.open-markdown-render-wrap');
openMarkdownRenderBtn.addEventListener('click', () => {
  closeAllWraps();
  markdownRender.classList.add('show');

  history.pushState(null, null, '#markdownRender');
})

const markdownRenderResultCont = markdownRender.querySelector('div.result');

let markdownRenderTimer = null;
const markdownRenderTextarea = markdownRender.querySelector('textarea');
markdownRenderTextarea.addEventListener('input', () => {
  clearTimeout(markdownRenderTimer);
  markdownRenderTimer = setTimeout(() => {
    const value = markdownRenderTextarea.value.trim();
    markdownRenderResultCont.innerHTML = renderMarkdownToHTML(value);
  }, 750);
});