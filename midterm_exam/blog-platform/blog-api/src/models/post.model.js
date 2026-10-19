const localStorage = require('./storage');

const STORAGE_KEY = 'posts';

let posts = [];

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        posts = parsed;
      }
    }
  } catch (err) {
    console.error('Error loading posts from storage:', err);
    posts = [];
  }
}

function syncToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

// Initial load
loadFromStorage();

const PostModel = {
  findAll() {
    loadFromStorage();
    return posts;
  },

  findById(id) {
    loadFromStorage();
    return posts.find((p) => p.id === Number(id)) || null;
  },

  findByUserId(userId) {
    loadFromStorage();
    return posts.filter((p) => p.user_id === Number(userId));
  },

  create({ user_id, title, content }) {
    loadFromStorage();
    const nextId = posts.length > 0 ? Math.max(...posts.map((p) => p.id)) + 1 : 1;
    const newPost = {
      id: nextId,
      user_id: Number(user_id),
      title,
      content,
    };
    posts.push(newPost);
    syncToStorage();
    return newPost;
  },

  update(id, { title, content }) {
    loadFromStorage();
    const post = posts.find((p) => p.id === Number(id));
    if (post) {
      if (title !== undefined) post.title = title;
      if (content !== undefined) post.content = content;
      syncToStorage();
      return post;
    }
    return null;
  },

  delete(id) {
    loadFromStorage();
    const initialLength = posts.length;
    posts = posts.filter((p) => p.id !== Number(id));
    if (posts.length !== initialLength) {
      syncToStorage();
      return true;
    }
    return false;
  },
};

module.exports = PostModel;
