// Set preloader text
whatIsLoadingText.textContent = 'Loading github logic...';

const GITHUB_API = 'https://api.github.com/users/';
const SEARCH_ALL_GITHUB_API = 'https://api.github.com/search/users?q=';
const GITHUB_GET_COMMITS_API = 'https://api.github.com/repos/';

const githubWrap = document.querySelector('.github-wrap');
githubWrap.addEventListener('click', e => {
  const target = e.target;
  if(!target.closest('.github-user-repo-block')) {
    for(let b of foundUserInfoContainer.querySelectorAll('.show-info-from-repo-block')) b.classList.remove('show');
  }
})
// Open
const openGithubWrapBtn = allDashboardItem.querySelector('.open-github-wrap');
openGithubWrapBtn.addEventListener('click', () => {
  closeAllWraps();
  githubWrap.classList.toggle('show');
});

let isFetchForShowCommits = false;
const foundUserInfoContainer = githubWrap.querySelector('.found-user-info-container');
foundUserInfoContainer.addEventListener('click', async e => {
  const target = e.target;
  if(target.tagName !== 'A' && !target.closest('.show-info-from-repo-block')) { // Show repo commits
    const infoBlock = target.closest('.github-user-repo-block');
    if(!infoBlock || isFetchForShowCommits) return;
    isFetchForShowCommits = true;

    const login = infoBlock.dataset.login;
    const repoName = infoBlock.dataset.repoName;

    const blockForShowRepoInfo = infoBlock.firstElementChild;
    blockForShowRepoInfo.classList.add('show');
    blockForShowRepoInfo.innerHTML = '<h3>Search... Please wait...</h3>';

    const resp = await fetch(`${GITHUB_GET_COMMITS_API}${login}/${repoName}/commits`);
    if(!resp.ok) {
      blockForShowRepoInfo.innerHTML = '<h3>Commits are not found</h3>';
      isFetchForShowCommits = false;
    }
    else {
      const data = await resp.json();
      blockForShowRepoInfo.innerHTML = initAllCommits(data);
      isFetchForShowCommits = false;
    }
  }
})

function initAllCommits(allCommits) {
  let result = `<p>Found commits ${allCommits.length}</p><br>`;

  for(let comObj of allCommits) {
    const commit = comObj.commit;
    result += `
<div data-sha='${comObj.sha}' class='user-github-commit-block'>
  <h3>${commit.author.name ? `Author name: ${hashHtmlSymbols(commit.author.name)}` : `Author email: ${hashHtmlSymbols(commit.author.email)}`}</h3>
  <p>Commit message: ${hashHtmlSymbols(commit.message)}</p>
</div>
`;
  }

  return result;
}

const searchGithubUserInput = githubWrap.querySelector('.search-github-user-input');
searchGithubUserInput.addEventListener('input', () => {
  searchGithubUserBtn.disabled = !searchGithubUserInput.value.trim();
})

const searchGithubUserBtn = githubWrap.querySelector('.search-github-user-btn');
searchGithubUserBtn.addEventListener('click', async () => {
  const val = searchGithubUserInput.value.trim();
  searchGithubUserBtn.disabled = true;
  searchGithubUserInput.value = '';
  if (!val) return;
  foundUserInfoContainer.innerHTML = '<h2>Search... Please wait...</h2>';
  const info = await searchGithubUser(val);
  foundUserInfoContainer.innerHTML = info;
})

async function searchGithubUser(searchLogin) {
  try {
    let resp = await fetch(`${GITHUB_API}${searchLogin}`);
    if (!resp.ok) {
      const searchData = await fetch(`${SEARCH_ALL_GITHUB_API}${searchLogin}`);
      if(!searchData.ok) return '<h2>Github user is not found</h2>';

      const foundData = await searchData.json();
      if(!foundData.items.length) return '<h2>Github user is not found</h2>';

      searchLogin = foundData.items[0].login;
      resp = await fetch(`${GITHUB_API}${searchLogin}`);
    }
    const data = await resp.json();

    let info_html = `
<img class='github-user-avatar' src='${data.avatar_url}' alt='${data.login}'>
<h2>${data.name}</h2>
<h4>${data.login}</h4>
<a href='${data.html_url}' target='_blank'>User page</a>
<br>

<p>Followers: ${data.followers}</p>
<p>Following: ${data.following}</p>
<hr>
`;
    const reposResp = await fetch(`${GITHUB_API}${searchLogin}/repos`);
    if (!reposResp.ok) info_html += '<h2>User repositories is not found</h2><hr>';
    else {
      const reposData = await reposResp.json();
      info_html += initAllRepos(reposData, searchLogin);
    }

    return info_html;
  } catch(e) { console.error(e); };
}

function initAllRepos(reposData, searchLogin) {
  let info_html = `<p>Found repositories ${reposData.length}<p><br>`;

  for (let repObj of reposData) {
  info_html += `
<div class='github-user-repo-block' data-login='${searchLogin}' data-repo-name='${repObj.name || repObj.full_name}'>
  <div class='show-info-from-repo-block'></div>
  <h2>${hashHtmlSymbols(repObj.name) || hashHtmlSymbols(repObj.full_name)}</h2>
  <a href='${hashHtmlSymbols(repObj.html_url)}' target='_blank'>Repository page</a>
  <p>${hashHtmlSymbols(repObj.description) || 'No description'}</p>
  <p>Stars: ${repObj.stargazers_count}⭐</p>
  <p>${repObj.language ? `Language: ${repObj.language}` : ''}</p>
</div>
`;
  }

  return info_html;
}

// Set preloader value
preloaderProgress.value = 12;