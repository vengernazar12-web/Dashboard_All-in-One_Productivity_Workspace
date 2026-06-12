function getCorrectUrlForBrowserWorkerIframe(url) {
  // YouTube
  const yt = url.match(/youtube\.com\/watch\?v=([\w-]+)(?:&(.+))?/);
  if (yt) {
    let embed = `https://www.youtube.com/embed/${yt[1]}`;
    if (yt[2]) embed += `?${yt[2]}`;
    return embed;
  }

  // Spotify
  if (url.includes('open.spotify.com')) return url.replace('open.spotify.com', 'open.spotify.com/embed');

  if (
    url.includes('google.com/maps')
    || url.includes('maps.google.com')
  ) return url.includes('output=embed') ? url : url + (url.includes('?') ? '&' : '?') + 'output=embed';

  return url;
}

const browserWorkerWrap = document.querySelector('.browser-worker-wrap');
// Open
const openBrowserWorkerBtn = allDashboardItem.querySelector('.open-browser-worker-wrap');
openBrowserWorkerBtn.addEventListener('click', () => {
  closeAllWraps();
  if(needPushState) history.pushState({}, null, '#browser-worker');
  browserWorkerWrap.classList.add('show');
})

const browserWorkerUrlInput = browserWorkerWrap.querySelector('input');

const browserWorkerIframe = browserWorkerWrap.querySelector('iframe');
const browserWorkerAudio = browserWorkerWrap.querySelector('audio');
const browserWorkerVideo = browserWorkerWrap.querySelector('video');

const setBrowserWorkerBtn = browserWorkerWrap.querySelector('.set-content');
setBrowserWorkerBtn.addEventListener('click', () => {
  const url = browserWorkerUrlInput.value.trim();
  if(!url) return;
  if(url.length > 500) return showResponseFn('URL is too long');

  const urlForSet = url.startsWith('http')
  ? getCorrectUrlForBrowserWorkerIframe(url)
  : `https://${getCorrectUrlForBrowserWorkerIframe(url)}`;

  if(/\.(mp3|ogg|wav)(\?|#|$)/.test(urlForSet)) { // If audio (music)
    browserWorkerIframe.src = '';

    browserWorkerVideo.pause();
    browserWorkerVideo.src = '';
    browserWorkerVideo.load();

    audio.src = urlForSet;
    audio.play().catch(() => {});
  }
  else if(/\.(mp4|webm)(\?|#|$)/.test(urlForSet)) { // If video
    browserWorkerIframe.src = '';

    browserWorkerAudio.pause();
    browserWorkerAudio.src = '';
    browserWorkerAudio.load();

    browserWorkerVideo.src = urlForSet;
  }
  else { // If non-audio and non-video
    browserWorkerAudio.pause();
    browserWorkerAudio.src = '';
    browserWorkerAudio.load();

    browserWorkerVideo.pause();
    browserWorkerVideo.src = '';
    browserWorkerVideo.load();

    browserWorkerIframe.src = urlForSet;
  }

  browserWorkerUrlInput.value = '';
})