const GITHUB_API = 'https://api.github.com/users/';
const SEARCH_ALL_GITHUB_API = 'https://api.github.com/search/users?q=';
const GITHUB_GET_COMMITS_API = 'https://api.github.com/repos/';

const githubWrap = document.querySelector('.github-wrap');
githubWrap.addEventListener('click', e => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const url = btn.dataset.url;
  if (!url) return;

  if(btn.classList.contains("btn-repos")) initAllRepos(url);
  else if(btn.classList.contains("btn-events")) initGithubUserEvents(url);
  else if(btn.classList.contains("btn-followers")) initGithubUserFollows(url);
  else if(btn.classList.contains("btn-following")) initGithubUserFollows(url);
  else if(btn.classList.contains("btn-starred")) initGithubUserStarred(url);
  else if(btn.classList.contains("btn-orgs")) initGithubUserOrgs(url);
  else if(btn.classList.contains('btn-commit-info')) initGithubUserCommitInfo(url);
  else if(btn.classList.contains('btn-commit-code')) initGithubUserCommitCode(url);
})
// Open
const openGithubWrapBtn = allDashboardItem.querySelector('.open-github-wrap');
openGithubWrapBtn.addEventListener('click', () => {
  closeAllWraps();
  if(needPushState) history.pushState({}, null, '#github');
  githubWrap.classList.toggle('show');
});

const githubLoader = githubWrap.querySelector('.loader');

const showGithubUserInfosCont = githubWrap.querySelector('.show-user-infos');
showGithubUserInfosCont.addEventListener('click', e => {
  const target = e.target;
  const closestRepoBlock = target.closest('.repo');

  if(closestRepoBlock) initGithubUserCommits(closestRepoBlock.dataset.commits);

  else if(target.closest('.back')) {
    githubShowsHistory.pop();
    if(!githubShowsHistory.length) return showGithubUserInfosCont.classList.remove('open');

    showGithubUserInfosCont.innerHTML = githubShowsHistory[githubShowsHistory.length - 1];
  }
  else if(target.closest('.close')) {
    githubShowsHistory.length = 0;
    showGithubUserInfosCont.classList.remove('open');
  }
})

const foundUserInfoContainer = githubWrap.querySelector('.found-user-info-container');

const searchGithubUserInput = githubWrap.querySelector('.search-github-user-input');
searchGithubUserInput.addEventListener('input', () => searchGithubUserBtn.disabled = !searchGithubUserInput.value.trim());

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

// Render github user events
function renderGithubUserEvents(e) {
  const user = hashHtmlSymbols(e?.actor?.login ?? "Unknown user");
  const repo = hashHtmlSymbols(e?.repo?.name ?? "Unknown repository");
  const action = hashHtmlSymbols(e?.payload?.action ?? "performed");
  const refType = hashHtmlSymbols(e?.payload?.ref_type ?? "item");
  const ref = hashHtmlSymbols(e?.payload?.ref ?? "");
  const prTitle = hashHtmlSymbols(e?.payload?.pull_request?.title ?? "Untitled pull request");
  const issueTitle = hashHtmlSymbols(e?.payload?.issue?.title ?? "Untitled issue");
  const releaseTag = hashHtmlSymbols(e?.payload?.release?.tag_name ?? "unknown version");
  const commitCount = e?.payload?.commits?.length ?? 0;

  switch (e?.type) {
    case "PushEvent":
      return `<strong>${user}</strong> pushed <strong>${commitCount}</strong> commit(s) to <strong>${repo}</strong>`;

    case "PullRequestEvent":
      return `<strong>${user}</strong> ${action} a pull request "<strong>${prTitle}</strong>" in <strong>${repo}</strong>`;

    case "IssuesEvent":
      return `<strong>${user}</strong> ${action} an issue "<strong>${issueTitle}</strong>" in <strong>${repo}</strong>`;

    case "IssueCommentEvent":
      return `<strong>${user}</strong> commented on issue "<strong>${issueTitle}</strong>" in <strong>${repo}</strong>`;

    case "WatchEvent":
      return `<strong>${user}</strong> starred <strong>${repo}</strong>`;

    case "ForkEvent":
      return `<strong>${user}</strong> forked <strong>${repo}</strong>`;

    case "CreateEvent":
      return `<strong>${user}</strong> created a new <strong>${refType}</strong> "<strong>${ref}</strong>" in <strong>${repo}</strong>`;

    case "DeleteEvent":
      return `<strong>${user}</strong> deleted a <strong>${refType}</strong> "<strong>${ref}</strong>" in <strong>${repo}</strong>`;

    case "ReleaseEvent":
      return `<strong>${user}</strong> published a release "<strong>${releaseTag}</strong>" in <strong>${repo}</strong>`;

    default:
      return `<strong>${user}</strong> performed <strong>${e?.type ?? "an action"}</strong> in <strong>${repo}</strong>`;
  }
}

function doLoadingGithubState(needBlock = true) {
  githubLoader.style.display = needBlock ? 'block' : 'none';
  for(const b of foundUserInfoContainer.querySelectorAll('div > div > button')) b.disabled = needBlock;
}

// Init functions ---
// repos
async function initAllRepos(url) {
  doLoadingGithubState();

  const resp = await fetch(url);
  const data = await resp.json();

  doLoadingGithubState(false);

  if(!data.length) return showResponseFn("No repos...");

  const repos_html = data.map(r => `
<div class="repo" data-commits='${r.commits_url.replace('{/sha}', '')}'>
  <h3>
    <a href="${r?.html_url ?? '#'}" target="_blank">
      <strong>${hashHtmlSymbols(r?.full_name) ?? 'Unknown repository'}</strong>
    </a>
  </h3>

  <p>${r?.description ?? 'No description provided'}</p>

  <pre>
Language: ${r?.language ?? 'Unknown'}
Stars: ${r?.stargazers_count ?? 0}
Forks: ${r?.forks_count ?? 0}
License: ${hashHtmlSymbols(r?.license?.name) ?? 'No license'}
Created: ${r?.created_at ? new Date(r.created_at).toLocaleDateString() : 'Unknown'}
Updated: ${r?.updated_at ? new Date(r.updated_at).toLocaleDateString() : 'Unknown'}
Default branch: ${r?.default_branch ?? 'main'}
Forked: ${r?.fork ? 'Yes' : 'No'}
  </pre>

  ${
    Array.isArray(r?.topics) && r.topics.length > 0
      ? `<div>${r.topics.map(t => `<span>${t}</span>`).join('')}</div>`
      : ''
  }
</div>
`.trim()).join('');

   initHtmlInGithubShowInfo(repos_html);
  showGithubUserInfosCont.classList.add('open');
};

// events
async function initGithubUserEvents(url) {
  doLoadingGithubState();

  const resp = await fetch(url);
  const data = await resp.json();

  doLoadingGithubState(false);

  if(!data.length) return showResponseFn("No events...");

  const info_html = data.map(e => `<div>${renderGithubUserEvents(e)}</div>`).join('');
   initHtmlInGithubShowInfo(info_html);
  showGithubUserInfosCont.classList.add('open');
};

// followers / following
async function initGithubUserFollows(url) {
  doLoadingGithubState();

  const resp = await fetch(url);
  const data = await resp.json();

  doLoadingGithubState(false);

  if(!data.length) return showResponseFn('No follows...');

  const followers_html = data.map(u => `
<div>
  <img src='${u.avatar_url}' loading='lazy'>
  <p>${hashHtmlSymbols(u.login)}</p>
  <a href='${u.html_url}' target="_blank">User page</a>
  <div class='user-actions'>
    <button class="btn-repos" data-url="${u.repos_url}">Repos</button>
    <button class="btn-events" data-url="${u.events_url.replace('{/privacy}', '')}">Events</button>
    <button class="btn-followers" data-url="${u.followers_url}">Followers</button>
    <button class="btn-following" data-url="${u.following_url.replace('{/other_user}', '')}">Following</button>
    <button class="btn-starred" data-url="${u.starred_url.replace('{/owner}{/repo}', '')}">Starred</button>
    <button class="btn-orgs" data-url="${u.organizations_url}">Orgs</button>
  </div>
</div>
`.trim()).join('');

   initHtmlInGithubShowInfo(followers_html);
  showGithubUserInfosCont.classList.add('open');
};

// starred
async function initGithubUserStarred(url) {
  doLoadingGithubState();

  const resp = await fetch(url);
  const data = await resp.json();

  doLoadingGithubState(false);

  if(!data.length) return showResponseFn("No stars...");

  const starred_html = data.map(u => `
<div>
  <h3>
    <a href="${u?.html_url ?? '#'}" target="_blank">
      <strong>${hashHtmlSymbols(u?.full_name) ?? 'Unknown repository'}</strong>
    </a>
  </h3>
  <p>${hashHtmlSymbols(u?.description) ?? 'No description provided'}</p>
  <pre>
Language: ${hashHtmlSymbols(u?.language) ?? 'Unknown'}
Stars: ${u?.stargazers_count ?? 0}
Forks: ${u?.forks_count ?? 0}
License: ${hashHtmlSymbols(u?.license?.name) ?? 'No license'}
Updated: ${u?.updated_at ? new Date(u.updated_at).toLocaleDateString() : 'Unknown'}
  </pre>

  ${
    Array.isArray(u?.topics) && u.topics.length > 0
      ? `<div>${u.topics.map(t => `<span>${hashHtmlSymbols(t)}</span>`).join(' ')}</div>`
      : ''
  }
</div>
`.trim()).join('');

   initHtmlInGithubShowInfo(starred_html);
  showGithubUserInfosCont.classList.add('open');
};

// orgs
async function initGithubUserOrgs(url) {
  doLoadingGithubState();

  const resp = await fetch(url);
  const data = await resp.json();

  doLoadingGithubState(false);

  if(!data.length) return showResponseFn('No orgs...');

  const orgs_html = data.map(u => `
<div>
  <img src="${u.avatar_url}" loading='lazy'>
  <pre>
<strong>Login:</strong> ${hashHtmlSymbols(u.login) ?? 'No login'}
<strong>Description</strong>: ${hashHtmlSymbols(u.description) || '...'}
  </pre>

  <div class='user-actions'>
    <button class="btn-repos" data-url="${u.repos_url}">Repos</button>
    <button class="btn-events" data-url="${u.events_url.replace('{/privacy}', '')}">Events</button>
  </div>
</div>
`.trim()).join('');

   initHtmlInGithubShowInfo(orgs_html);
  showGithubUserInfosCont.classList.add('open');
};

// commits
async function initGithubUserCommits(url) {
  doLoadingGithubState();

  const resp = await fetch(url);
  const data = await resp.json();

  doLoadingGithubState(false);

  if(!data.length) return showResponseFn('No commits...');

  const commits_html = data.map(c => {
    const login = hashHtmlSymbols(c?.author?.login) ?? "Unknown user";
    const avatar = c?.author?.avatar_url ?? "";
    const name = hashHtmlSymbols(c?.commit?.committer?.name) ?? "No name";
    const email = c?.commit?.committer?.email ?? "No email";
    const date = c?.commit?.committer?.date
      ? new Date(c.commit.committer.date).toLocaleString()
      : "No date";
    const message = hashHtmlSymbols(c?.commit?.message) ?? "No message";
    const sha = c?.sha?.slice(0, 7) ?? "unknown";
    const html = c?.html_url ?? "#";
    const parents = c?.parents?.length ?? 0;

    return `
<div class="commit">
  <h3>
    <img src="${avatar}" alt="${login}" loading='lazy'>
    <strong>${login}</strong>
  </h3>

  <pre>
<strong>Commit:</strong> ${sha}
<strong>Message:</strong> ${message}

<strong>Committer:</strong> ${name}
<strong>Email:</strong> ${email}
<strong>Date:</strong> ${date}
<strong>Parents:</strong> ${parents}

<a href="${html}" target="_blank">View on GitHub</a>
  </pre>

  <div class='user-actions'>
    <button class='btn-commit-info' data-url='${c.url}'>Commit info</button>
  </div>
</div>
    `.trim();
  }).join('');

  initHtmlInGithubShowInfo(commits_html);
  showGithubUserInfosCont.classList.add('open');
}

// commit info
async function initGithubUserCommitInfo(url) {
  doLoadingGithubState();

  const resp = await fetch(url);
  const data = await resp.json();

  doLoadingGithubState(false);

  const commit_info_html = data.files.map(f => `
<div>
  <pre>
Changes: ${f.changes}
  Additions: ${f.additions}
  Deletions: ${f.deletions}
File name: ${f.filename}
Status: ${f.status}
  </pre>

<div class='user-actions'>
  <button class='btn-commit-code' data-url='${f.contents_url}'>View code</button>
</div>
</div>
`.trim()).join('');

  initHtmlInGithubShowInfo(commit_info_html);
  showGithubUserInfosCont.classList.add('open');
}

// commit code
async function initGithubUserCommitCode(url) {
  doLoadingGithubState();

  const resp = await fetch(url);
  const data = await resp.json();
  const code = `<pre>${atob(data.content)}</pre>`;

  doLoadingGithubState(false);

  initHtmlInGithubShowInfo(code);
  showGithubUserInfosCont.classList.add('open');
}

// Write to container fn
const githubShowsHistory = [];
function initHtmlInGithubShowInfo(html) {
  const htmlResult = `
<button class='back'>«--</button>
<button class='close'>✕</button>
${html}
`.trim();

  showGithubUserInfosCont.innerHTML = htmlResult;

  githubShowsHistory.push(htmlResult);
}

// Search users
async function searchGithubUsers(searchLogin) {
  try {
    let resp = await fetch(`${SEARCH_ALL_GITHUB_API}${searchLogin}`);
    const data = await resp.json();

    if(!data?.items?.length) return '<h2>Not found</h2>';

    let info_html = '';

    for(let user of data.items) {
      info_html += `
<div class="github-user">
  <img class='github-user-avatar' src='${user.avatar_url}' alt='${user.login}' loading='lazy'>
  <h3>${user.login}</h3>
  <a href='${user.html_url}' target='_blank'>User page</a>

  <div class='user-actions'>
    <button class="btn-repos" data-url="${user.repos_url}">Repos</button>
    <button class="btn-events" data-url="${user.events_url.replace('{/privacy}', '')}">Events</button>
    <button class="btn-followers" data-url="${user.followers_url}">Followers</button>
    <button class="btn-following" data-url="${user.following_url.replace('{/other_user}', '')}">Following</button>
    <button class="btn-starred" data-url="${user.starred_url.replace('{/owner}{/repo}', '')}">Starred</button>
    <button class="btn-orgs" data-url="${user.organizations_url}">Orgs</button>
  </div>
</div>
`;
    };

    return info_html || '<h4>No commits returned</h4>';
  } catch(e) { console.error(e); };
}