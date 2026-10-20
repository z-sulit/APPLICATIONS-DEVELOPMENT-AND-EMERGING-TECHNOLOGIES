const crypto = require('crypto'); //cryptographic functions for hashing and secure comparisons
const localStorage = require('./storage');

const STORAGE_KEY = 'users';
let users = [];

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        users = parsed;
      }
    }
  } catch (err) {
    console.error('Error loading users from storage:', err);
    users = [];
  }
}

// Save the current users array to localStorage
function syncToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

// Initial load
loadFromStorage();


// generate a random salt, hash the password with scryptSync, and returns a string in the format "salt:hash"
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}
//if missing database record is missing the colon separator, fial verification
function verifyPassword(password, storedPassword) {
  if (!storedPassword || typeof storedPassword !== 'string') return false;
  const parts = storedPassword.split(':');
  if (parts.length !== 2) return false;


  const [salt, originalHash] = parts;
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');

  // convert both hashes to buffers, examine lenghts
  const hashBuffer = Buffer.from(hash, 'hex');
  const originalBuffer = Buffer.from(originalHash, 'hex');
  if (hashBuffer.length !== originalBuffer.length) return false;
  return crypto.timingSafeEqual(hashBuffer, originalBuffer);
}

const UserModel = {
  findAll() {
    loadFromStorage();
    return users;
  },

  findById(id) {
    loadFromStorage();
    return users.find((u) => u.id === Number(id)) || null;
  },

  findByUsername(username) {
    loadFromStorage();
    return users.find((u) => u.username.toLowerCase() === username.toLowerCase()) || null;
  },

  findByRefreshToken(refreshToken) {
    loadFromStorage();
    return users.find((u) => u.refresh_token === refreshToken) || null;
  },

  create({ username, password, role }) {
    loadFromStorage();
    const nextId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
    const newUser = {
      id: nextId,
      username,
      hashed_password: hashPassword(password),
      role,
      refresh_token: null,
      created_at: new Date().toISOString(),
      revoked_at: null,
    };
    users.push(newUser);
    syncToStorage();
    return newUser;
  },

  updateRefreshToken(id, refreshToken) {
    loadFromStorage();
    const user = users.find((u) => u.id === Number(id));
    if (user) {
      user.refresh_token = refreshToken;
      user.revoked_at = null;
      syncToStorage();
      return user;
    }
    return null;
  },

  revokeToken(refreshToken) {
    loadFromStorage();
    const user = users.find((u) => u.refresh_token === refreshToken);
    if (user) {
      user.refresh_token = null;
      user.revoked_at = new Date().toISOString();
      syncToStorage();
      return user;
    }
    return null;
  },

  verifyPassword,
};

module.exports = UserModel;
