const GITHUB_API = 'https://api.github.com/users/';
const SEARCH_ALL_GITHUB_API = 'https://api.github.com/search/users?q=';
const GITHUB_GET_COMMITS_API = 'https://api.github.com/repos/';

const githubWrap = document.querySelector('.github-wrap');
githubWrap.addEventListener('click', async e => {
  const target = e.target;

  const closestGithubUser = target.closest('.github-user');
  const closestGithubRepoBlock = target.closest('.github-user-repo-block');

  const closestUserRepos = target.closest('.show-user-repos');
  const closestReposCommits = target.closest('.show-repos-commits');

  if(
    showReposCommitsCont.classList.contains('open')
    && !closestGithubUser
    && !closestReposCommits
  ) showReposCommitsCont.classList.remove('open');
  else if(
    showUserReposCont.classList.contains('open')
    && !closestGithubUser
    && !closestUserRepos
  ) showUserReposCont.classList.remove('open');

  else if(target.tagName !== 'A' && closestGithubUser) { // Show repos
    const reposUrl = closestGithubUser.dataset.reposUrl;

    githubLoader.style.display = 'block';
    try {
      const reposResp = await fetch(reposUrl);
      const reposData = await reposResp.json();

      showUserReposCont.innerHTML = initAllRepos(reposData);
      showUserReposCont.classList.add('open');

      githubLoader.style.display = 'none';
    } catch(e) {
      showResponseFn(`Error: ${e}`);
      githubLoader.style.display = 'none';
    }
  }
  else if(target.tagName !== 'A' && closestGithubRepoBlock) { // Show commits
    const commitsUrl = closestGithubRepoBlock.dataset.commitsUrl;

    githubLoader.style.display = 'block';
    try {
      const commitsResp = await fetch(commitsUrl);
      const commitsData = await commitsResp.json();

      showReposCommitsCont.innerHTML = initAllCommits(commitsData);
      showReposCommitsCont.classList.add('open');

      githubLoader.style.display = 'none';
    } catch(e) {
      showResponseFn(`Error: ${e}`);
      githubLoader.style.display = 'none';
    }
  }
})
// Open
const openGithubWrapBtn = allDashboardItem.querySelector('.open-github-wrap');
openGithubWrapBtn.addEventListener('click', () => {
  closeAllWraps();
  githubWrap.classList.toggle('show');
});

const githubLoader = githubWrap.querySelector('.loader');

const showUserReposCont = githubWrap.querySelector('.show-user-repos');
const showReposCommitsCont = githubWrap.querySelector('.show-repos-commits');

const foundUserInfoContainer = githubWrap.querySelector('.found-user-info-container');

const searchGithubUserInput = githubWrap.querySelector('.search-github-user-input');
searchGithubUserInput.addEventListener('input', () => {
  searchGithubUserBtn.disabled = !searchGithubUserInput.value.trim();
})

const searchGithubUserBtn = githubWrap.querySelector('.search-github-user-btn');
searchGithubUserBtn.addEventListener('click', async () => {
  const val = searchGithubUserInput.value.trim();

  if (!val) return;

  searchGithubUserBtn.disabled = true;
  searchGithubUserInput.value = '';

  foundUserInfoContainer.innerHTML = '<h2>Search... Please wait...</h2>';

  const info = await searchGithubUsers(val);
  foundUserInfoContainer.innerHTML = info;

  searchGithubUserBtn.disabled = false;
})

async function searchGithubUsers(searchLogin) {
  try {
    let resp = await fetch(`${SEARCH_ALL_GITHUB_API}${searchLogin}`);
    const data = await resp.json();

    if(!data?.items?.length) return '<h2>Not found</h2>';

    let info_html = '';

    for(let user of data.items) {
      info_html += `
<div data-repos-url="${user.repos_url}" class="github-user">
  <img class='github-user-avatar' src='${user.avatar_url}' alt='${user.login}'>
  <h4>${user.login}</h4>
  <a href='${user.html_url}' target='_blank'>User page</a>
</div>
`;
    };

    return info_html || '<h4>No commits returned</h4>';
  } catch(e) { console.error(e); };
}

function initAllRepos(reposData) {
  let info_html = '';

  for (let repObj of reposData) {
  info_html += `
<div class='github-user-repo-block' data-commits-url='${repObj.commits_url.replace(/\{\/sha\}$/, '')}'>
  <h3>${hashHtmlSymbols(repObj.name) || hashHtmlSymbols(repObj.full_name)}</h3>
  <a href='${hashHtmlSymbols(repObj.html_url)}' target='_blank'>Repository page</a>
  <p> Description: ${hashHtmlSymbols(repObj.description) || 'No description'}</p>
  <p>Stars: ${repObj.stargazers_count}⭐</p>
  <p>${repObj.language ? `Language: ${repObj.language}` : ''}</p>
</div>
`;
  }

  return info_html || '<h4>No repositories returned</h4>';
}

function initAllCommits(allCommits) {
  let result = ``;

  for(let comObj of allCommits) {
    const commit = comObj.commit;
    result += `
<div class='user-github-commit-block'>
  <h3>${commit.author.name ? `Author: ${hashHtmlSymbols(commit.author.name)}` : `Author email: ${hashHtmlSymbols(commit.author.email)}`}</h3>
  <p>Message: ${hashHtmlSymbols(commit.message)}</p>
</div>
`;
  }

  return result;
}