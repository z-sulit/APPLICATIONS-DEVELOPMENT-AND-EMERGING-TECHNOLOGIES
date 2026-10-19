// Blogbloblog Bento Client Controller
const AUTH_URL = 'http://localhost:4000';
const BLOG_URL = window.location.port === '5000' ? '' : 'http://localhost:5000';

let currentUser = null; // { id, username, role }
let accessToken = localStorage.getItem('accessToken') || '';
let refreshToken = localStorage.getItem('refreshToken') || '';
let currentView = 'all'; // 'all' or 'mine'
let postsCache = [];

// DOM References
const systemDot = document.getElementById('system-dot');
const systemStatusText = document.getElementById('system-status-text');
const tokenStatusPill = document.getElementById('token-status-pill');
const roleStatusPill = document.getElementById('role-status-pill');

const navUsername = document.getElementById('nav-username');
const navUserRole = document.getElementById('nav-user-role');
const btnNavAuth = document.getElementById('btn-nav-auth');
const navAuthLabel = document.getElementById('nav-auth-label');

const navAll = document.getElementById('nav-all');
const navMine = document.getElementById('nav-mine');
const navCompose = document.getElementById('nav-compose');

const ctaActionPanel = document.getElementById('cta-action-panel');
const ctaActionLabel = document.getElementById('cta-action-label');

const panelTabbedHeader = document.getElementById('panel-tabbed-header');
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const formLogin = document.getElementById('form-login');
const formRegister = document.getElementById('form-register');
const formEditor = document.getElementById('form-editor');
const readerNotice = document.getElementById('reader-notice');

const editorTitle = document.getElementById('editor-title');
const editPostId = document.getElementById('edit-post-id');
const editorPostTitle = document.getElementById('editor-post-title');
const editorPostContent = document.getElementById('editor-post-content');
const btnSubmitDispatch = document.getElementById('btn-submit-dispatch');
const btnEditorLabel = document.getElementById('btn-editor-label');
const btnCancelEdit = document.getElementById('btn-cancel-edit');

const btnFilterAll = document.getElementById('btn-filter-all');
const btnFilterMine = document.getElementById('btn-filter-mine');
const btnFilterRoles = document.getElementById('btn-filter-roles');

const feedHeadingText = document.getElementById('feed-heading-text');
const btnRefreshFeed = document.getElementById('btn-refresh-feed');
const dispatchesGrid = document.getElementById('dispatches-bento-grid');

const claimUserVal = document.getElementById('claim-user-val');
const claimRoleVal = document.getElementById('claim-role-val');
const claimIdVal = document.getElementById('claim-id-val');
const claimExpVal = document.getElementById('claim-exp-val');

const btnTriggerRefresh = document.getElementById('btn-trigger-refresh');
const btnTriggerLogout = document.getElementById('btn-trigger-logout');

function setStatus(message, isError = false) {
  systemStatusText.textContent = message;
  systemStatusText.style.color = isError ? 'var(--color-red)' : 'var(--text-white)';
  systemDot.style.backgroundColor = isError ? 'var(--color-red)' : 'var(--color-green)';
  systemDot.style.boxShadow = isError ? '0 0 8px rgba(239, 68, 68, 0.8)' : '0 0 8px rgba(34, 197, 94, 0.6)';

  setTimeout(() => {
    systemStatusText.textContent = 'Connected to Auth (:4000) & Blog API (:5000)';
    systemStatusText.style.color = 'var(--text-white)';
    systemDot.style.backgroundColor = 'var(--color-green)';
    systemDot.style.boxShadow = '0 0 8px rgba(34, 197, 94, 0.6)';
  }, 6000);
}

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function updateAuthState() {
  if (accessToken) {
    const decoded = parseJwt(accessToken);
    if (decoded && decoded.exp * 1000 > Date.now()) {
      currentUser = { id: decoded.id, username: decoded.username, role: decoded.role, exp: decoded.exp };
      
      // Top status & nav badges
      tokenStatusPill.textContent = 'Token: Active (15m)';
      roleStatusPill.textContent = `Role: ${currentUser.role}`;
      navUsername.textContent = currentUser.username;
      navUserRole.textContent = currentUser.role;
      navAuthLabel.textContent = 'Log Out';

      // Claims drawer
      claimUserVal.textContent = currentUser.username;
      claimRoleVal.textContent = currentUser.role;
      claimIdVal.textContent = `#${currentUser.id}`;
      claimExpVal.textContent = new Date(currentUser.exp * 1000).toLocaleTimeString();

      // Workspace slot based on role
      panelTabbedHeader.classList.add('hidden');
      formLogin.classList.add('hidden');
      formRegister.classList.add('hidden');

      if (currentUser.role === 'reader') {
        formEditor.classList.add('hidden');
        readerNotice.classList.remove('hidden');
        ctaActionLabel.textContent = 'Active Reader';
      } else {
        readerNotice.classList.add('hidden');
        formEditor.classList.remove('hidden');
        ctaActionLabel.textContent = 'Write Dispatch';
      }
      return;
    }
  }

  // Guest State
  currentUser = null;
  accessToken = '';
  localStorage.removeItem('accessToken');

  tokenStatusPill.textContent = 'Token: Guest';
  roleStatusPill.textContent = 'Role: None';
  navUsername.textContent = 'Guest';
  navUserRole.textContent = 'Guest';
  navAuthLabel.textContent = 'Log In';

  claimUserVal.textContent = 'None (Guest)';
  claimRoleVal.textContent = 'None';
  claimIdVal.textContent = '—';
  claimExpVal.textContent = '—';

  // Workspace shows Login/Register
  panelTabbedHeader.classList.remove('hidden');
  readerNotice.classList.add('hidden');
  formEditor.classList.add('hidden');
  tabLogin.click();
  ctaActionLabel.textContent = 'Write / Sign In';

  if (currentView === 'mine') {
    switchView('all');
  }
}

// Fetch Posts from Blog API
async function fetchPosts() {
  try {
    let url = `${BLOG_URL}/api/posts`;
    const headers = {};

    if (currentView === 'mine') {
      if (!accessToken) {
        setStatus('Log in required to view your personal dispatches.', true);
        switchView('all');
        return;
      }
      url = `${BLOG_URL}/api/me/posts`;
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const res = await fetch(url, { headers });
    const data = await res.json();

    if (!res.ok) {
      setStatus(`Blog API error: ${data.error || 'Failed to fetch'}`, true);
      return;
    }

    postsCache = data;
    renderPosts(data);
  } catch (err) {
    setStatus(`Network error connecting to Blog API: ${err.message}`, true);
  }
}

function renderPosts(posts) {
  if (!posts || posts.length === 0) {
    dispatchesGrid.innerHTML = `
      <div class="empty-state-bento">
        <p style="font-size: 1.125rem; font-weight: 600; margin-bottom: 6px;">No dispatches published yet</p>
        <p style="font-size: 0.875rem;">Log in as an <strong>author</strong> or <strong>admin</strong> to publish the first dispatch.</p>
      </div>
    `;
    return;
  }

  dispatchesGrid.innerHTML = posts
    .map((post) => {
      const isOwner = currentUser && currentUser.id === post.user_id;
      const isAdmin = currentUser && currentUser.role === 'admin';
      const canEdit = isOwner || isAdmin;
      const canDelete = isAdmin;

      return `
      <article class="post-bento-card" data-id="${post.id}">
        <div class="card-header-band">
          <span>POST #${post.id}</span>
          <span>AUTHOR ID: ${post.user_id}</span>
        </div>
        <div class="card-content-body">
          <span class="author-pill-tag">Dispatch</span>
          <h3 class="post-card-title">${escapeHtml(post.title)}</h3>
          <p class="post-card-excerpt">${escapeHtml(post.content)}</p>
          <div class="card-footer-actions">
            ${canEdit ? `<button class="action-link" onclick="startEditPost(${post.id})">Edit Post</button>` : ''}
            ${canDelete ? `<button class="action-link action-link-danger" onclick="deletePost(${post.id})">Delete Post</button>` : ''}
            <button class="action-link" style="color: var(--text-muted);" onclick="viewPostJson(${post.id})">View JSON</button>
          </div>
        </div>
      </article>
      `;
    })
    .join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

window.viewPostJson = function(id) {
  const post = postsCache.find((p) => p.id === id);
  if (post) {
    alert(JSON.stringify(post, null, 2));
  }
};

// Form Handlers
formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch(`${AUTH_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      setStatus(`Login rejected: ${data.error}`, true);
      return;
    }

    accessToken = data.accessToken;
    refreshToken = data.refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    updateAuthState();
    setStatus(`Authenticated as ${currentUser.username} (${currentUser.role})`);
    fetchPosts();
  } catch (err) {
    setStatus(`Login network error: ${err.message}`, true);
  }
});

formRegister.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('reg-username').value;
  const password = document.getElementById('reg-password').value;
  const role = document.getElementById('reg-role').value;

  try {
    const res = await fetch(`${AUTH_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role }),
    });
    const data = await res.json();

    if (!res.ok) {
      setStatus(`Registration rejected: ${data.error}`, true);
      return;
    }

    setStatus(`User ${username} registered successfully! You may now sign in.`);
    tabLogin.click();
    document.getElementById('login-username').value = username;
  } catch (err) {
    setStatus(`Registration error: ${err.message}`, true);
  }
});

// Post Create / Update
formEditor.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!accessToken) {
    setStatus('Authentication required to publish dispatches.', true);
    return;
  }

  const id = editPostId.value;
  const title = editorPostTitle.value;
  const content = editorPostContent.value;

  try {
    const url = id ? `${BLOG_URL}/api/posts/${id}` : `${BLOG_URL}/api/posts`;
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ title, content }),
    });
    const data = await res.json();

    if (!res.ok) {
      setStatus(`Blog API rejected: ${data.error}`, true);
      return;
    }

    setStatus(id ? `Dispatch #${id} updated!` : 'New dispatch published to Blog API (:5000)!');
    resetEditor();
    fetchPosts();
  } catch (err) {
    setStatus(`Publish error: ${err.message}`, true);
  }
});

window.startEditPost = function(id) {
  const post = postsCache.find((p) => p.id === id);
  if (!post) return;

  editPostId.value = post.id;
  editorPostTitle.value = post.title;
  editorPostContent.value = post.content;
  editorTitle.textContent = `Edit Dispatch #${post.id}`;
  btnEditorLabel.textContent = 'Save Changes to Blog API';
  btnCancelEdit.style.display = 'inline';

  document.getElementById('interactive-workspace').scrollIntoView({ behavior: 'smooth' });
};

function resetEditor() {
  editPostId.value = '';
  editorPostTitle.value = '';
  editorPostContent.value = '';
  editorTitle.textContent = 'Compose Dispatch';
  btnEditorLabel.textContent = 'Publish to Blog API (:5000)';
  btnCancelEdit.style.display = 'none';
}

btnCancelEdit.addEventListener('click', resetEditor);

window.deletePost = async function(id) {
  if (!confirm(`Are you sure you want to permanently delete Dispatch #${id}?`)) return;

  try {
    const res = await fetch(`${BLOG_URL}/api/posts/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();

    if (!res.ok) {
      setStatus(`Delete error: ${data.error}`, true);
      return;
    }

    setStatus(`Dispatch #${id} deleted successfully from Blog API.`);
    fetchPosts();
  } catch (err) {
    setStatus(`Delete error: ${err.message}`, true);
  }
};

// Token Lifecycle Handlers
btnTriggerRefresh.addEventListener('click', async () => {
  if (!refreshToken) {
    setStatus('No refresh token present in session. Please sign in.', true);
    return;
  }

  try {
    const res = await fetch(`${AUTH_URL}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await res.json();

    if (!res.ok) {
      setStatus(`Token refresh rejected: ${data.error}`, true);
      return;
    }

    accessToken = data.accessToken;
    localStorage.setItem('accessToken', accessToken);
    updateAuthState();
    setStatus('Access token rotated successfully via Auth Server (:4000).');
  } catch (err) {
    setStatus(`Refresh error: ${err.message}`, true);
  }
});

btnTriggerLogout.addEventListener('click', async () => {
  try {
    if (refreshToken) {
      await fetch(`${AUTH_URL}/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    }
  } catch (err) {
    console.error('Logout error:', err);
  } finally {
    accessToken = '';
    refreshToken = '';
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    updateAuthState();
    setStatus('Logged out. Refresh token revoked on Auth Server.');
    fetchPosts();
  }
});

// UI Toggles & Nav
btnNavAuth.addEventListener('click', () => {
  if (currentUser) {
    btnTriggerLogout.click();
  } else {
    document.getElementById('interactive-workspace').scrollIntoView({ behavior: 'smooth' });
  }
});

ctaActionPanel.addEventListener('click', () => {
  document.getElementById('interactive-workspace').scrollIntoView({ behavior: 'smooth' });
});

tabLogin.addEventListener('click', () => {
  tabLogin.classList.add('active');
  tabRegister.classList.remove('active');
  formLogin.classList.remove('hidden');
  formRegister.classList.add('hidden');
});

tabRegister.addEventListener('click', () => {
  tabRegister.classList.add('active');
  tabLogin.classList.remove('active');
  formRegister.classList.remove('hidden');
  formLogin.classList.add('hidden');
});

function switchView(view) {
  currentView = view;
  if (view === 'all') {
    btnFilterAll.classList.add('active');
    btnFilterMine.classList.remove('active');
    navAll.classList.add('active');
    navMine.classList.remove('active');
    feedHeadingText.textContent = 'Our Dispatches';
  } else {
    btnFilterMine.classList.add('active');
    btnFilterAll.classList.remove('active');
    navMine.classList.add('active');
    navAll.classList.remove('active');
    feedHeadingText.textContent = 'My Personal Dispatches';
  }
  fetchPosts();
}

btnFilterAll.addEventListener('click', () => switchView('all'));
btnFilterMine.addEventListener('click', () => switchView('mine'));
navAll.addEventListener('click', () => switchView('all'));
navMine.addEventListener('click', () => switchView('mine'));
navCompose.addEventListener('click', () => {
  document.getElementById('interactive-workspace').scrollIntoView({ behavior: 'smooth' });
});

btnFilterRoles.addEventListener('click', () => {
  document.querySelector('.footer-wrapper').scrollIntoView({ behavior: 'smooth' });
});

btnRefreshFeed.addEventListener('click', fetchPosts);

// Init
updateAuthState();
fetchPosts();
