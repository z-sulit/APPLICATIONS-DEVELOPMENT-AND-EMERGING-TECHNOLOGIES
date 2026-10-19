// Blogbloblog Client Controller
const AUTH_URL = 'http://localhost:4000';
const BLOG_URL = window.location.port === '5000' ? '' : 'http://localhost:5000';

let currentUser = null; // { id, username, role }
let accessToken = sessionStorage.getItem('accessToken') || '';
let refreshToken = sessionStorage.getItem('refreshToken') || '';
let currentView = 'all'; // 'all' or 'mine'
let postsCache = [];

// DOM Elements
const banner = document.getElementById('status-banner');
const userDisplay = document.getElementById('user-display');
const btnAuthToggle = document.getElementById('btn-auth-toggle');
const btnRefreshToken = document.getElementById('btn-refresh-token');
const btnLogout = document.getElementById('btn-logout');
const authCard = document.getElementById('auth-card');
const postCard = document.getElementById('post-card');
const postCardTitle = document.getElementById('post-card-title');
const btnSubmitPost = document.getElementById('btn-submit-post');
const btnCancelEdit = document.getElementById('btn-cancel-edit');
const editPostIdInput = document.getElementById('edit-post-id');
const postTitleInput = document.getElementById('post-title');
const postContentInput = document.getElementById('post-content');
const dispatchesFeed = document.getElementById('dispatches-feed');
const filterAll = document.getElementById('filter-all');
const filterMine = document.getElementById('filter-mine');
const feedTitle = document.getElementById('feed-title');

// Tabs in Auth Card
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const formLogin = document.getElementById('form-login');
const formRegister = document.getElementById('form-register');

function showBanner(message, type = 'success') {
  banner.textContent = message;
  banner.className = `status-banner ${type}`;
  setTimeout(() => {
    banner.className = 'status-banner';
    banner.textContent = '';
  }, 5000);
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
      currentUser = { id: decoded.id, username: decoded.username, role: decoded.role };
      userDisplay.textContent = `[${currentUser.username} (${currentUser.role})]`;
      btnAuthToggle.classList.add('hidden');
      btnRefreshToken.classList.remove('hidden');
      btnLogout.classList.remove('hidden');
      filterMine.classList.remove('hidden');
      authCard.classList.add('hidden');
      return;
    }
  }

  // Guest state
  currentUser = null;
  accessToken = '';
  sessionStorage.removeItem('accessToken');
  userDisplay.textContent = '[Guest]';
  btnAuthToggle.classList.remove('hidden');
  btnRefreshToken.classList.add('hidden');
  btnLogout.classList.add('hidden');
  filterMine.classList.add('hidden');
  if (currentView === 'mine') {
    switchView('all');
  }
}

async function fetchPosts() {
  try {
    let url = `${BLOG_URL}/api/posts`;
    const headers = {};

    if (currentView === 'mine') {
      url = `${BLOG_URL}/api/me/posts`;
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const res = await fetch(url, { headers });
    const data = await res.json();

    if (!res.ok) {
      showBanner(data.error || 'Failed to fetch dispatches', 'error');
      return;
    }

    postsCache = data;
    renderPosts(data);
  } catch (err) {
    showBanner(`Network error: ${err.message}`, 'error');
  }
}

function renderPosts(posts) {
  if (!posts || posts.length === 0) {
    dispatchesFeed.innerHTML = '<div class="empty-state">No dispatches published yet.</div>';
    return;
  }

  dispatchesFeed.innerHTML = posts
    .map((post) => {
      const canEdit = currentUser && (currentUser.id === post.user_id || currentUser.role === 'admin');
      const canDelete = currentUser && currentUser.role === 'admin';

      return `
      <article class="post-card" data-id="${post.id}">
        <h3 class="post-title">${escapeHtml(post.title)}</h3>
        <p class="post-body">${escapeHtml(post.content)}</p>
        <div class="post-meta">
          <span class="author-tag">Author ID: ${post.user_id}</span>
          ${canEdit || canDelete ? '<span class="post-separator">|</span>' : ''}
          <div class="post-actions">
            ${canEdit ? `<button class="btn-sm btn-edit" onclick="startEditPost(${post.id})">[Edit]</button>` : ''}
            ${canDelete ? `<button class="btn-sm btn-danger btn-delete" onclick="deletePost(${post.id})">[Delete]</button>` : ''}
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

// Auth handlers
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
      showBanner(data.error || 'Login failed', 'error');
      return;
    }

    accessToken = data.accessToken;
    refreshToken = data.refreshToken;
    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);

    updateAuthState();
    showBanner(`Welcome back, ${currentUser.username}!`);
    fetchPosts();
  } catch (err) {
    showBanner(`Login failed: ${err.message}`, 'error');
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
      showBanner(data.error || 'Registration failed', 'error');
      return;
    }

    showBanner('Registration successful! Please log in with your credentials.');
    tabLogin.click();
    document.getElementById('login-username').value = username;
  } catch (err) {
    showBanner(`Registration failed: ${err.message}`, 'error');
  }
});

btnRefreshToken.addEventListener('click', async () => {
  if (!refreshToken) {
    showBanner('No refresh token available. Please log in again.', 'error');
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
      showBanner(data.error || 'Token refresh failed', 'error');
      return;
    }

    accessToken = data.accessToken;
    sessionStorage.setItem('accessToken', accessToken);
    updateAuthState();
    showBanner('Access Token refreshed successfully!');
  } catch (err) {
    showBanner(`Token refresh failed: ${err.message}`, 'error');
  }
});

btnLogout.addEventListener('click', async () => {
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
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    accessToken = '';
    refreshToken = '';
    updateAuthState();
    showBanner('Logged out successfully.');
    fetchPosts();
  }
});

// Post creation / update
document.getElementById('form-post').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!accessToken) {
    showBanner('You must be logged in to post.', 'error');
    authCard.classList.remove('hidden');
    return;
  }

  const editId = editPostIdInput.value;
  const title = postTitleInput.value;
  const content = postContentInput.value;

  try {
    let url = `${BLOG_URL}/api/posts`;
    let method = 'POST';

    if (editId) {
      url = `${BLOG_URL}/api/posts/${editId}`;
      method = 'PUT';
    }

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
      showBanner(data.error || 'Failed to save post', 'error');
      return;
    }

    showBanner(editId ? 'Post updated successfully!' : 'Dispatch published successfully!');
    resetPostForm();
    postCard.classList.add('hidden');
    fetchPosts();
  } catch (err) {
    showBanner(`Post error: ${err.message}`, 'error');
  }
});

window.startEditPost = function (id) {
  const post = postsCache.find((p) => p.id === id);
  if (!post) return;

  editPostIdInput.value = post.id;
  postTitleInput.value = post.title;
  postContentInput.value = post.content;
  postCardTitle.textContent = `Edit Dispatch #${post.id}`;
  btnSubmitPost.textContent = 'Update Dispatch';
  btnCancelEdit.classList.remove('hidden');
  postCard.classList.remove('hidden');
  postCard.scrollIntoView({ behavior: 'smooth' });
};

window.deletePost = async function (id) {
  if (!confirm('Are you sure you want to delete this dispatch?')) return;

  try {
    const res = await fetch(`${BLOG_URL}/api/posts/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      showBanner(data.error || 'Failed to delete post', 'error');
      return;
    }

    showBanner(data.message || 'Post deleted successfully!');
    fetchPosts();
  } catch (err) {
    showBanner(`Delete error: ${err.message}`, 'error');
  }
};

function resetPostForm() {
  editPostIdInput.value = '';
  postTitleInput.value = '';
  postContentInput.value = '';
  postCardTitle.textContent = 'Publish Blogbloblog Post Form';
  btnSubmitPost.textContent = 'Publish Dispatch';
  btnCancelEdit.classList.add('hidden');
}

btnCancelEdit.addEventListener('click', resetPostForm);

// UI Toggles & Views
btnAuthToggle.addEventListener('click', () => {
  authCard.classList.toggle('hidden');
});

document.getElementById('btn-close-auth').addEventListener('click', () => {
  authCard.classList.add('hidden');
});

document.getElementById('nav-new-blog').addEventListener('click', (e) => {
  e.preventDefault();
  if (!accessToken) {
    showBanner('Please log in as an Author or Admin to create posts.', 'error');
    authCard.classList.remove('hidden');
    return;
  }
  resetPostForm();
  postCard.classList.toggle('hidden');
  if (!postCard.classList.contains('hidden')) {
    postCard.scrollIntoView({ behavior: 'smooth' });
  }
});

document.getElementById('btn-close-post').addEventListener('click', () => {
  postCard.classList.add('hidden');
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
    filterAll.classList.add('active');
    filterMine.classList.remove('active');
    feedTitle.textContent = 'All Dispatches';
  } else {
    filterMine.classList.add('active');
    filterAll.classList.remove('active');
    feedTitle.textContent = 'My Dispatches';
  }
  fetchPosts();
}

filterAll.addEventListener('click', () => switchView('all'));
filterMine.addEventListener('click', () => switchView('mine'));
document.getElementById('btn-refresh-feed').addEventListener('click', fetchPosts);

// Init
updateAuthState();
fetchPosts();
