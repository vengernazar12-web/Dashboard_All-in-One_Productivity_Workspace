const IP_SEARCH_API = 'https://ip-service.vengernazar0.workers.dev/';

const ipSearchWrap = document.querySelector('.ip-search-wrap');
// Open
const openIpSearchBtn = allDashboardItem.querySelector('.open-ip-search-wrap');
openIpSearchBtn.addEventListener('click', () => {
  closeAllWraps();
  if(needPushState) history.pushState({}, null, '#ip-search');
  ipSearchWrap.classList.add('show');
})

const searchIpLoader = ipSearchWrap.querySelector('.loader');

const userIpInput = ipSearchWrap.querySelector('input');
const foundIpResultCont = ipSearchWrap.querySelector('div');

const searchIpBtn = ipSearchWrap.querySelector('button');
searchIpBtn.addEventListener('click', async () => {
  const ip = userIpInput.value.trim();
  if (!ip) return;

  searchIpLoader.style.display = 'block';
  searchIpBtn.disabled = true;

  try {
    const resp = await fetch(IP_SEARCH_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify({ ip })
    });

    foundIpResultCont.innerHTML = await resp.text();
  } catch (e) {
    showResponseFn(e.message);
    foundIpResultCont.innerHTML = `Error: ${e.message}`
  };

  searchIpLoader.style.display = 'none';
  searchIpBtn.disabled = false;
  userIpInput.value = '';
})