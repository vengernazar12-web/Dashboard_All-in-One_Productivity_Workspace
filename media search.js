async function setSavedMedia() {
  const savedMediaSearchMedia = localStorage.getItem('media-search_media');
  if (savedMediaSearchMedia) {
    mediaSearchSelectMedia.value = savedMediaSearchMedia;
    if (mediaForNotWorkCountrySelect.includes(savedMediaSearchMedia)) mediaSearchSelectCountry.classList.add('not-work');

    if (savedMediaSearchMedia === 'country' && !allCountriesForShowMedia) {
      showPreloader();
      preloaderProgress.max = 1;
      preloaderProgress.value = 0;
      whatIsLoadingText.textContent = 'Loading countries...';

      allCountriesForShowMedia = await fetch('https://restcountries.com/v3.1/all?fields=flags,name,capital,currencies').then(r => r.json());

      preloaderProgress.value = 1;
      setTimeout(() => showPreloader(false), 500);
    }
  };
};
let savedMediaBeenSet = false;
const mediaSearchWrap = document.querySelector('.media-search-wrap');
// Open
const openMediaSearchBtn = allDashboardItem.querySelector('.open-media-search-wrap');
openMediaSearchBtn.addEventListener('click', () => {
  closeAllWraps();
  if(needPushState) history.pushState({}, null, '#media-search');
  if(!savedMediaBeenSet) setSavedMedia();
  mediaSearchWrap.classList.add('show');
});

const mediaSearchLoader = mediaSearchWrap.querySelector('.loader');

const mediaSearchShowInfoWindow = mediaSearchWrap.querySelector('.show-info-popup');
mediaSearchShowInfoWindow.addEventListener('click', e => {
  const target = e.target;

  if(target.closest('.close-btn')) {
    mediaSearchShowInfoWindow.textContent = '';
    mediaSearchShowInfoWindow.classList.remove('open');
  }
})

const mediaSearchSelectCountry = mediaSearchWrap.querySelector('select.country');
mediaSearchSelectCountry.addEventListener('change', () => {
  const val = mediaSearchSelectCountry.value;

  localStorage.setItem('media-search_country', val);
});

const savedMediaSearchCountry = localStorage.getItem('media-search_country');
if(savedMediaSearchCountry) mediaSearchSelectCountry.value = savedMediaSearchCountry;

const mediaForNotWorkCountrySelect = ['literature', 'visual', 'emoji', 'country', 'word', 'recipes', 'chem', 'nasa'];

let allCountriesForShowMedia = null;

const mediaSearchSelectMedia = mediaSearchWrap.querySelector('select.media');
mediaSearchSelectMedia.addEventListener('change', async () => {
  const val = mediaSearchSelectMedia.value;

  if(mediaForNotWorkCountrySelect.includes(val)) mediaSearchSelectCountry.classList.add('not-work');
  else mediaSearchSelectCountry.classList.remove('not-work');

  localStorage.setItem('media-search_media', val);

  if(val === 'country' && !allCountriesForShowMedia) {
    showPreloader();
    preloaderProgress.max = 1;
    preloaderProgress.value = 0;
    whatIsLoadingText.textContent = 'Loading countries...';

    allCountriesForShowMedia = await fetch('https://restcountries.com/v3.1/all?fields=flags,name,capital,currencies').then(r => r.json());

    preloaderProgress.value = 1;
    setTimeout(() => showPreloader(false), 500);
  }
});

const mediaSearchValuesCont = mediaSearchWrap.querySelector('datalist#search-values');

let mediaSearchShowChemDatalistTimer = null;
const searchMediaInput = mediaSearchWrap.querySelector('.search');
searchMediaInput.addEventListener('input', () => {
  const media = mediaSearchSelectMedia.value;

  if(media === 'country') {
    const value = searchMediaInput.value.trim().toLowerCase();
    const frag = document.createDocumentFragment();

    for(const obj of allCountriesForShowMedia) {
      const currencyName = Object.keys(obj.currencies)[0] || 'N/A';
      const currencyInfo = obj.currencies[currencyName];

      if(
        obj.capital.some(c => c.toLowerCase().includes(value))
        || currencyName.toLowerCase().includes(value)
        || currencyInfo?.symbol.includes(value)
        || currencyInfo?.name.toLowerCase().includes(value)
        || obj.name.official.toLowerCase().includes(value)
      ) {
        const option = document.createElement('option');
        option.textContent = `${obj.name.official} | ${obj.capital.join(',')} | ${currencyName} (${currencyInfo?.symbol || 'N/A'})`;
        option.value = obj.name.official;
        frag.appendChild(option);
      }
    }

    mediaSearchValuesCont.textContent = '';
    mediaSearchValuesCont.appendChild(frag);
  }

  else if(media === 'chem') {
    clearTimeout(mediaSearchShowChemDatalistTimer);
    mediaSearchShowChemDatalistTimer = setTimeout(async () => {
      const val = searchMediaInput.value.trim();
      if(!val) return;
      const foundVals = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete/compound/${encodeURIComponent(val)}/json`)
      .then(r => r.json())
      .then(d => d?.dictionary_terms?.compound ?? []);

      mediaSearchValuesCont.innerHTML = foundVals.map(v => `<option>${v}</option>`).join();
    }, 500);
  }

  else {
    const savedSearchValues = JSON.parse(localStorage.getItem('saved-media-search-values') || "[]");
    mediaSearchValuesCont.innerHTML = savedSearchValues.map(v => `<option>${v}</option>`).join('');
  }
})

const mediaSearchCache = [];

const searchMusicResult = mediaSearchWrap.querySelector('.result');
searchMusicResult.addEventListener('play', e => {
  const target = e.target;
  if (target.tagName === 'AUDIO') { for (const a of searchMusicResult.querySelectorAll('.track > audio')) if (a !== target) a.pause(); }
}, true);

searchMusicResult.addEventListener('click', async e => {
  const target = e.target;

  if (target.classList.contains('show-info')) {
    const div = document.createElement('div');
    div.innerHTML = mediaSearchCache.find(obj => obj.title === target.dataset.info).content;
    target.replaceWith(div);
  } else if(target.closest('.copy-btn')) {
    navigator.clipboard.writeText(target.closest('h3')?.firstElementChild?.textContent);
    showResponseFn('Copied');
  }

  else if(target.closest('[data-audio]')) {
    const url = target.closest('[data-audio]').dataset.audio;
    const audio = new Audio(url.startsWith('http') ? url : url.startsWith('//') ? `https:${url}` : `https://${url}`);
    audio.play();
  }

  else if (target.closest('.show-recipe')) {
    const recipeId = target.closest('.show-recipe').dataset.id;

    mediaSearchShowInfoWindow.classList.add('open');
    mediaSearchShowInfoWindow.innerHTML = await fetch('https://search-recipes.vengernazar0.workers.dev', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: recipeId, need: 'get-recipe' })
    }).then(r => r.text());
  }
})

const searchMediaBtn = mediaSearchWrap.querySelector('.send');
searchMediaBtn.addEventListener('click', async () => {
  const value = searchMediaInput.value.trim();
  if (mediaSearchSelectMedia.value !== 'nasa' && !value) return;
  if (value.length > 200) return showResponseFn('Your search value is too long (>200 symbols)');

  const country = mediaSearchSelectCountry.value || 'UA';
  const media = mediaSearchSelectMedia.value || 'music';

  mediaSearchLoader.style.display = 'block';
  searchMediaBtn.disabled = true;

  mediaSearchCache.length = 0;

  const savedSearchValues = JSON.parse(localStorage.getItem('saved-media-search-values') || "[]");
  savedSearchValues.unshift(value);
  localStorage.setItem('saved-media-search-values', JSON.stringify([...new Set(savedSearchValues)].slice(-10)));

  try {
    await mediaSearchFetchRenderMap[media](country, value);

    searchMusicResult.innerHTML = mediaSearchCache.map(obj => obj.content
      ? `<button data-info="${obj.title}" class="show-info">${obj.title}</button>`
      : ''
    ).join('');

    if (!searchMusicResult.textContent.length) return searchMusicResult.innerHTML = '<h3>Nothing found...</h3>';
  } catch (e) { showResponseFn(`Error: ${e.message}`); }
  finally {
    mediaSearchLoader.style.display = 'none';
    searchMediaBtn.disabled = false;
  }
})

function getMediaSearchCopyBtnHtml() { return "<span><button class='copy-btn'><svg><use href='#copy-code'></use></svg></button></span>"; }
const mediaSearchFetchRenderMap = {
  music: async (country, value) => {
    await Promise.all([
      // Fetch songs
      fetch(`
https://itunes.apple.com/search
?term=${encodeURIComponent(value)}
&entity=song
&limit=50
&media=music
&country=${country}
`).then(r => r.json()).then(d => mediaSearchCache.push({
        content: d.results.map(obj => `
<div class='result-info' data-marker='song'>
  <img
    src="${obj.artworkUrl100.replace('100x100bb', '250x250bb')}"
    alt="${obj.trackName}" loading="lazy"
  >

  <h3><span>${obj.trackName}</span>${getMediaSearchCopyBtnHtml()}</h3>
  <p>${obj.artistName}</p>

  <div>
    <span>${obj.collectionName}</span>
    <span> • ${obj.primaryGenreName}</span>
    <span> • ${new Date(obj.releaseDate).getFullYear()}</span>
    <span> • ${Math.floor(obj.trackTimeMillis / 60000)}:${String(Math.floor((obj.trackTimeMillis % 60000) / 1000)).padStart(2, '0')}</span>
  </div>

  <div>
    <p><a href="${obj.trackViewUrl}" target="_blank">Track page</a></p>
    <p><a href="${obj.artistViewUrl}" target="_blank">Artist</a></p>
    <p><a href="${obj.collectionViewUrl}" target="_blank">Album</a></p>
  </div>

  <audio controls controlsList="nodownload noplaybackrate" preload="metadata" src="${obj.previewUrl}"></audio>
</div>
`.trim()).join(''), title: `SONGS (${d.resultCount})`
      })),

      // Fetch artists
      fetch(`
https://itunes.apple.com/search
?term=${encodeURIComponent(value)}
&entity=musicArtist
&limit=50
&media=music
&country=${country}
`).then(r => r.json()).then(d => mediaSearchCache.push({
        content: d.results.map(obj => `
<div class='result-info' data-marker='artist'>
  <h3><span>${obj.artistName}</span>${getMediaSearchCopyBtnHtml()}</h3>
  <a href='${obj.artistLinkUrl}'>Artist</a>
</div>
`.trim()).join(''), title: `ARTISTS (${d.resultCount})`
      })),

      // Fetch albums
      fetch(`
https://itunes.apple.com/search
?term=${encodeURIComponent(value)}
&entity=album
&limit=50
&media=music
&country=${country}
`).then(r => r.json()).then(d => mediaSearchCache.push({
        content: d.results.map(obj => `
<div class='result-info' data-marker='album'>
  <img
    src="${obj.artworkUrl100.replace('100x100bb', '250x250bb')}"
    alt="${obj.collectionName}"
    loading="lazy"
  >

  <h3><span>${obj.collectionName}</span>${getMediaSearchCopyBtnHtml()}</h3>
  <p>${obj.artistName}</p>

  <div>
    <span>${obj.primaryGenreName}</span>
    <span> • ${obj.trackCount} tracks</span>
    <span> • ${new Date(obj.releaseDate).getFullYear()}</span>
  </div>

  <a href="${obj.collectionViewUrl}" target="_blank">Open album</a>
</div>
`.trim()).join(''), title: `ALBUMS (${d.resultCount})`
      }))
    ]);
  },

  podcast: async (country, value) => {
    // Fetch podcasts
    await Promise.all([
      fetch(`
https://itunes.apple.com/search
?term=${encodeURIComponent(value)}
&entity=podcast
&limit=30
&media=podcast
&country=${country}
`).then(r => r.json()).then(d => mediaSearchCache.push({
        content: d.results.map(obj => `
<div class="result-info" data-marker="PODCAST">
  <img
    src="${obj.artworkUrl600}"
    alt="${obj.collectionName}"
    loading="lazy"
  >

  <h3><span>${obj.collectionName}</span>${getMediaSearchCopyBtnHtml()}</h3>
  <p>${obj.artistName}</p>

  <div>
    <span>${obj.primaryGenreName}</span>
    <span> • ${obj.trackCount} episodes</span>
    <span> • ${new Date(obj.releaseDate).getFullYear()}</span>
  </div>

  <div>
    <p><a href="${obj.trackViewUrl}" target="_blank">Podcast page</a></p>
    <p><a href="${obj.collectionViewUrl}" target="_blank">Collection</a></p>
    <p><a href="${obj.feedUrl}" target="_blank">RSS Feed</a></p>
  </div>
</div>
`.trim()).join(''), title: `PODCASTS (${d.resultCount})`
      })),

      // Fetch podcastEpisodes
      fetch(`
https://itunes.apple.com/search
?term=${encodeURIComponent(value)}
&entity=podcastEpisode
&limit=30
&media=podcast
&country=${country}
`).then(r => r.json()).then(d => mediaSearchCache.push({
        content: d.results.map(obj => `
<div class="result-info" data-marker="EPISODE">
  <img
    src="${obj.artworkUrl600}"
    alt="${obj.trackName}"
    loading="lazy"
  >

  <h3><span>${obj.trackName}</span>${getMediaSearchCopyBtnHtml()}</h3>
  <p>${obj.collectionName}</p>

  <div>
    <span>${Math.floor(obj.trackTimeMillis / 60000)} min</span>
    <span> • ${new Date(obj.releaseDate).getFullYear()}</span>
    <span> • ${obj.contentAdvisoryRating}</span>
  </div>

  <p>
    ${(obj.shortDescription || obj.description || '').slice(0, 200)}
  </p>

  <div>
    <p><a href="${obj.trackViewUrl}" target="_blank">Episode page</a></p>
    <p><a href="${obj.collectionViewUrl}" target="_blank">Podcast</a></p>
  </div>

  <audio
    controls
    controlsList="nodownload noplaybackrate"
    preload="metadata"
    src="${obj.previewUrl}"
  ></audio>
</div>
`.trim()).join(''), title: `PODCAST EPISODES (${d.resultCount})`
      })),
    ])
  },

  audiobook: async (country, value) => {
    await fetch(`
https://itunes.apple.com/search
?term=${encodeURIComponent(value)}
&media=audiobook
&entity=audiobook
&limit=50
&country=${country}
`).then(r => r.json()).then(d => mediaSearchCache.push({
      content: d.results.map(obj => `
<div class="result-info" data-marker="AUDIOBOOK">
  <img
    src="${obj.artworkUrl100.replace('100x100bb', '250x250bb')}"
    alt="${obj.collectionName}"
    loading="lazy"
  >

  <h3><span>${obj.collectionName}</span>${getMediaSearchCopyBtnHtml()}</h3>
  <p>${obj.artistName}</p>

  <div>
    <span>${obj.primaryGenreName}</span>
    <span> • ${new Date(obj.releaseDate).getFullYear()}</span>
    <span> • ${obj.collectionPrice} ${obj.currency}</span>
  </div>

  <div>
    <p><a href="${obj.collectionViewUrl}" target="_blank">Audiobook</a></p>
    <p><a href="${obj.artistViewUrl}" target="_blank">Author</a></p>
  </div>

  <details>
    <summary>Description</summary>
    <p>${obj.description.replace(/<[^>]+>/g, '')}</p>
  </details>

  <audio
    controls
    controlsList="nodownload noplaybackrate"
    preload="metadata"
    src="${obj.previewUrl}"
  ></audio>
</div>
`.trim()).join(''), title: `AUDIOBOOKS (${d.resultCount})`
    }))
  },

  musicVideo: async (country, value) => {
    await fetch(`
https://itunes.apple.com/search
?term=${encodeURIComponent(value)}
&media=musicVideo
&entity=musicVideo
&limit=30
&country=${country}
`).then(r => r.json()).then(d => mediaSearchCache.push({
      content: d.results.map(obj => `
<div class="result-info" data-marker="VIDEO">
  <img
    src="${obj.artworkUrl100.replace('100x100bb', '400x400bb')}"
    alt="${obj.trackName}"
    loading="lazy"
  >

  <h3><span>${obj.trackName}</span>${getMediaSearchCopyBtnHtml()}</h3>
  <p>${obj.artistName}</p>

  <div>
    <span>${obj.primaryGenreName}</span>
    <span> • ${new Date(obj.releaseDate).getFullYear()}</span>
    <span> • ${Math.floor(obj.trackTimeMillis / 60000)}:${String(Math.floor((obj.trackTimeMillis % 60000) / 1000)).padStart(2, '0')}</span>
    <span> • ${obj.trackPrice} ${obj.currency}</span>
  </div>

  <div>
    <p><a href="${obj.trackViewUrl}" target="_blank">Video page</a></p>
    <p><a href="${obj.artistViewUrl}" target="_blank">Artist</a></p>
  </div>

  <video
    controls
    preload="metadata"
    playsinline
    src="${obj.previewUrl}"
    poster="${obj.artworkUrl100.replace('100x100bb', '1000x1000bb')}"
  ></video>
</div>
`.trim()).join(''), title: `MUSIC VIDEOS (${d.resultCount})`
    }))
  },

  software: async (country, value) => {
    await fetch(`
https://itunes.apple.com/search
?term=${encodeURIComponent(value)}
&media=software
&entity=software
&limit=75
&country=${country}
`).then(r => r.json()).then(d => mediaSearchCache.push({
      content: d.results.map(obj => `
<div class="result-info" data-marker="APP">
  <img
    src="${obj.artworkUrl512 || obj.artworkUrl100}"
    alt="${obj.trackName}"
    loading="lazy"
  >

  <h3><span>${obj.trackName}</span>${getMediaSearchCopyBtnHtml()}</h3>
  <p>${obj.sellerName}</p>

  <div>
    <span>${obj.primaryGenreName}</span>
    <span> • ${obj.formattedPrice}</span>
    <span> • ${obj.contentAdvisoryRating}</span>
    <span> • v${obj.version}</span>
  </div>

  <div>
    <span>${Math.round(Number(obj.fileSizeBytes) / 1024 / 1024)} MB</span>
    <span> • iOS ${obj.minimumOsVersion}+</span>
    <span> • ${new Date(obj.releaseDate).getFullYear()}</span>
  </div>

  <div>
    <p>
      <a href="${obj.trackViewUrl}" target="_blank">
        App Store
      </a>
    </p>

    <p>
      <a href="${obj.artistViewUrl}" target="_blank">
        Developer
      </a>
    </p>

    ${obj.sellerUrl ? `
    <p>
      <a href="${obj.sellerUrl}" target="_blank">
        Website
      </a>
    </p>` : ''
        }
  </div>

  ${obj.screenshotUrls?.length ? `
  <div>
    ${obj.screenshotUrls.slice(0, 3).map(url => `
      <img
        src="${url}"
        alt="Screenshot"
        loading="lazy"
      >
    `).join('')}
  </div>` : ''
        }

  <details>
    <summary>Description</summary>
    <p>${obj.description}</p>
  </details>
</div>
`.trim()).join(''), title: `SOFTWARE (${d.resultCount})`
    }))
  },

  ebook: async (country, value) => {
    await fetch(`
https://itunes.apple.com/search
?term=${encodeURIComponent(value)}
&media=ebook
&entity=ebook
&limit=150
&country=${country}
`).then(r => r.json()).then(d => mediaSearchCache.push({
  content: d.results.map(obj => `
<div class="result-info" data-marker="EBOOK">
  <img
    src="${obj.artworkUrl100?.replace('100x100bb', '250x250bb')}"
    alt="${obj.trackName}"
    loading="lazy"
  >

  <h3><span>${obj.trackName}</span>${getMediaSearchCopyBtnHtml()}</h3>
  <p>${obj.artistName}</p>

  <div>
    <span>${obj.formattedPrice}</span>
    <span> • ${obj.averageUserRating ?? 'N/A'}★</span>
    <span>
      • ${typeof obj.userRatingCount === 'number'
        ? obj.userRatingCount.toLocaleString()
        : '0'} ratings
    </span>
    <span> • ${new Date(obj.releaseDate).getFullYear()}</span>
  </div>

  <div>
    <span>${obj.genres?.slice(0, 3)?.join(' • ') ?? ''}</span>
  </div>

  <div>
    <p><a href="${obj.trackViewUrl}" target="_blank">Book</a></p>
    <p><a href="${obj.artistViewUrl}" target="_blank">Author</a></p>
  </div>

  <details>
    <summary>Description</summary>
    <p>${(obj.description ?? '').replaceAll('<br/>', ' ').replaceAll('<br />', ' ')}</p>
  </details>
</div>
`.trim()).join(''), title: `EBooks (${d.resultCount})`
}))
  },

  literature: async (_, value) => {
    await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(value)}`)
    .then(r => r.json()).then(d => mediaSearchCache.push({
      content: d.docs.map(obj => `
<div class="result-info" data-marker="BOOK">
  ${
    obj.cover_i
      ? `<img
          src="https://covers.openlibrary.org/b/id/${obj.cover_i}-L.jpg"
          alt="${obj.title}"
          loading="lazy"
        >`
      : ''
  }

  <h3><span>${obj.title}</span>${getMediaSearchCopyBtnHtml()}</h3>

  <p>${obj.author_name?.join(', ') || 'Unknown author'}</p>

  <div>
    ${
      obj.first_publish_year
        ? `<span>${obj.first_publish_year}</span>`
        : ''
    }

    ${
      obj.edition_count
        ? `<span> • ${obj.edition_count} editions</span>`
        : ''
    }

    ${
      obj.language?.length
        ? `<span> • ${obj.language.join(', ').toUpperCase()}</span>`
        : ''
    }
  </div>

  <div>
    ${
      obj.has_fulltext
        ? '<span>📖 Full text available</span>'
        : '<span>📕 Metadata only</span>'
    }

    ${
      obj.ebook_access && obj.ebook_access !== 'no_ebook'
        ? `<span> • ${obj.ebook_access}</span>`
        : ''
    }
  </div>

  <div>
    <p>
      <a
        href="https://openlibrary.org${obj.key}"
        target="_blank"
      >
        Open Library
      </a>
    </p>

    ${
      obj.author_key?.[0] ? `<p>
            <a
              href="https://openlibrary.org/authors/${obj.author_key[0]}"
              target="_blank"
            > Author
            </a>
          </p>` : ''
    }
  </div>
</div>
`.trim()).join(''), title: `LITERATURE (${d.docs.length})`
    }));
  },

  visual: async (_, value) => {
    await fetch('https://media-search-visual-data.vengernazar0.workers.dev/', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ value })
    }).then(r => r.json()).then(d => !d.error ? d.forEach(obj => mediaSearchCache.push(obj)) : showResponse(`Something went wrong... Please try again later... (${d.error})`));
  },

  emoji: async (_, value) => {
    fetch(`https://emojihub.yurace.pro/api/search?q=${encodeURIComponent(value)}`)
      .then(r => r.json())
      .then(d => mediaSearchCache.push({
        content: d.map(obj => `
  <div class="result-info" data-marker="EMOJI">
    <h3><span>${obj.htmlCode[0]}</span>${getMediaSearchCopyBtnHtml()}</h3>
    <h3><span>${obj.name}</span>${getMediaSearchCopyBtnHtml()}</h3>
    <p>${obj.category} • ${obj.group}</p>
    <div>${obj.unicode.map(u => `<span>${u}</span>`).join(' • ')}</div>
  </div>
  `.trim()).join(''), title: 'EMOJI'
      }));
  },

  country: async (_, value) => {
    try {
      await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(value.trim())}`)
        .then(r => r.json())
        .then(d => mediaSearchCache.push({
          content: d.map(obj => `
<div class="result-info" data-marker="COUNTRY">
  <img
    src="${obj.flags.png}"
    alt="${obj.flags.alt || obj.name.official}"
    loading="lazy"
  >

  <img
    src="${obj.coatOfArms?.png}"
    alt="Coat of Arms"
    loading="lazy"
  >

  <h3>
    <span>${obj.flag} ${obj.name.official}</span>
    ${getMediaSearchCopyBtnHtml()}
  </h3>

  <p>
    <strong>${obj.name.common}</strong>
    ${obj.altSpellings?.length ? ` • ${obj.altSpellings.join(', ')}` : ''}
  </p>

  <div>
    <span>🏛️ ${obj.capital?.join(', ') || 'N/A'}</span>
    <span> • 🌍 ${obj.region}</span>
    ${obj.subregion ? `<span> • ${obj.subregion}</span>` : ''}
  </div>

  <div>
    <span>👥 ${obj.population.toLocaleString()}</span>
    <span> • 📐 ${obj.area.toLocaleString()} km²</span>
  </div>

  <div>
    <span>
      💰 ${Object.entries(obj.currencies || {})
              .map(([code, cur]) => `${code} (${cur.symbol || '?'})`)
              .join(', ')
            }
    </span>
  </div>

  <div>
    <span>🗣️ ${Object.values(obj.languages || {}).join(', ')}</span>
  </div>

  <div>
    <span>
      🕒 ${obj.timezones?.join(', ') || 'N/A'}
    </span>
    <span> • 📅 ${obj.startOfWeek}</span>
  </div>

  <div>
    <span>🚗 Driving: ${obj.car?.side || 'N/A'}</span>
    ${obj.car?.signs?.length
              ? `<span> • ${obj.car.signs.join(', ')}</span>`
              : ''
            }
  </div>

  ${obj.borders?.length ? `
      <details>
        <summary>Borders (${obj.borders.length})</summary>
        <p>${obj.borders.join(', ')}</p>
      </details>` : ''
            }

  ${Object.keys(obj.translations || {}).length ? `
    <details>
      <summary>translations</summary>
      ${Object.keys(obj.translations).map(c => `<p>${c}: ${obj.translations[c].official}</p>`).join('')}
    </details>
  ` : ''}

  <div>
    <p>
      <a href="${obj.maps.googleMaps}" target="_blank">Google Maps</a>
    </p>

    <p>
      <a href="${obj.maps.openStreetMaps}" target="_blank">OpenStreetMap</a>
    </p>
  </div>
</div>
`.trim()).join(''), title: `COUNTRIES (${d.length})`
        }));
    } catch(e) { showResponseFn(`Error: please try enter country name!`); }
  },

  word: async (_, value) => {
    await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(value)}`)
    .then(r => r.json())
    .then(d => mediaSearchCache.push({
      content: Array.isArray(d) ? d.map(obj => `
<div class="result-info" data-marker="WORD">
  <h2>${obj.word}</h2>

  ${obj.phonetic ? `<div>/${obj.phonetic}/</div>` : ""}

  ${
    obj.phonetics?.find(p => p.audio)?.audio ? `
      <div>
        <button data-audio="${obj.phonetics.find(p => p.audio).audio}">Pronunciation</button>
      </div>` : ""
  }

  ${
    obj.origin ? `
      <hr>
      <div><b>Origin:</b> ${obj.origin}</div>
      ` : ""
  }

  <hr>

  ${obj.meanings.map(meaning => `
    <div>
      <h3>${meaning.partOfSpeech}</h3>

      <ol>
        ${meaning.definitions.map(def => `
          <li>
            ${def.definition}

            ${def.example
              ? `<div><i>"${def.example}"</i></div>`
              : ""}

            ${def.synonyms?.length
              ? `
              <div>
                <b>Synonyms:</b>
                ${def.synonyms.join(", ")}
              </div>
              `
              : ""}

            ${def.antonyms?.length
              ? `
              <div>
                <b>Antonyms:</b>
                ${def.antonyms.join(", ")}
              </div>
              `
              : ""}

          </li>
        `).join("")}
      </ol>
    </div>
  `).join("")}
</div>
`.trim()).join('') : `<h3>${d.title}</h3><p>${d.message}</p>`, title: `WORDS (${d.length || 0})`
    }))
  },

  recipes: async (_, value) => {
    await fetch(`https://search-recipes.vengernazar0.workers.dev`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ value, need: 'search-list' })
    })
    .then(r => r.json())
    .then(d => d.error ? mediaSearchCache.push({ content: `Error: ${e.message}`, title: 'ERROR' }) : mediaSearchCache.push(d));
  },

  chem: async (_, value) => {
    await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(value)}/JSON`)
    .then(r => r.json())
    .then(d => mediaSearchCache.push({
      content: d.PC_Compounds?.map(obj => `
<div class="result-info" data-marker="CHEM">
  <h2>
    ${obj.props?.find(p => p.urn?.label === "IUPAC Name" && p.urn?.name === "Preferred")?.value?.sval
      || obj.props?.find(p => p.urn?.label === "IUPAC Name")?.value?.sval
      || "Unknown"}
  </h2>

  <p><strong>CID:</strong> ${obj.id?.id?.cid ?? "—"}</p>

  <p><strong>Formula:</strong> ${
    obj.props?.find(p => p.urn?.label === "Molecular Formula")?.value?.sval ?? "—"
  }</p>

  <hr>

  <h3>⚡ Key Properties</h3>

  <p>⚖️ Molecular weight:
    <strong>${
      obj.props?.find(p => p.urn?.label === "Molecular Weight")?.value?.sval ?? "—"
    } g/mol</strong>
  </p>

  <p>🧪 LogP:
    <strong>${
      obj.props?.find(p => p.urn?.label === "Log P")?.value?.fval ??
      obj.props?.find(p => p.urn?.label === "Log P")?.value?.sval ??
      "—"
    }</strong>
  </p>

  <p>📐 TPSA:
    <strong>${
      obj.props?.find(p => p.urn?.label === "Topological")?.value?.fval ?? "—"
    }</strong>
  </p>

  <p>⚡ Charge:
    <strong>${obj.charge ?? "—"}</strong>
  </p>

  <hr>

  <h3>🧬 Structure</h3>

  <p>SMILES:
    <code>${
      obj.props?.find(p => p.urn?.label === "SMILES")?.value?.sval ?? "—"
    }</code>
  </p>

  <p>InChIKey:
    <code>${
      obj.props?.find(p => p.urn?.label === "InChIKey")?.value?.sval ?? "—"
    }</code>
  </p>

  <p>InChI:
    <code>${
      obj.props?.find(p => p.urn?.label === "InChI")?.value?.sval ?? "—"
    }</code>
  </p>

  <hr>

  <h3>🔬 Bio / Interaction</h3>

  <p>H-bond donors:
    <strong>${
      obj.props?.find(p => p.urn?.label === "Count" && p.urn?.name === "Hydrogen Bond Donor")?.value?.ival ?? "—"
    }</strong>
  </p>

  <p>H-bond acceptors:
    <strong>${
      obj.props?.find(p => p.urn?.label === "Count" && p.urn?.name === "Hydrogen Bond Acceptor")?.value?.ival ?? "—"
    }</strong>
  </p>

  <p>Rotatable bonds:
    <strong>${
      obj.props?.find(p => p.urn?.label === "Count" && p.urn?.name === "Rotatable Bond")?.value?.ival ?? "—"
    }</strong>
  </p>

  <hr>

  <h3>📊 Extra</h3>

  <p>Complexity:
    <strong>${
      obj.props?.find(p => p.urn?.label === "Compound Complexity")?.value?.fval ?? "—"
    }</strong>
  </p>

  <p>Source:
    <a href="https://pubchem.ncbi.nlm.nih.gov/compound/${obj.id?.id?.cid}" target="_blank">
      PubChem
    </a>
  </p>
</div>
`.trim()).join(''), title: `CHEM (${d.PC_Compounds?.length || 0})`
    }))
  },

  nasa: async (_, value) => {
    await fetch('https://nasa-search.vengernazar0.workers.dev', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ value })
    }).then(r => r.json()).then(d => d.error ? showResponseFn(`Error: ${d.error}`) : d.forEach(obj => mediaSearchCache.push(obj)));
  }
}