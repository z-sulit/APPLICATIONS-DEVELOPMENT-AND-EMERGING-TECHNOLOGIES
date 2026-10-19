const fs = require('fs');
const path = require('path');

const storageDir = path.resolve(__dirname, '../../../data');
const storageFile = path.resolve(storageDir, 'localStorage.json');

function ensureFile() {
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }
  if (!fs.existsSync(storageFile)) {
    fs.writeFileSync(storageFile, JSON.stringify({}), 'utf-8');
  }
}

const localStorage = {
  getItem(key) {
    ensureFile();
    try {
      const raw = fs.readFileSync(storageFile, 'utf-8');
      const store = JSON.parse(raw || '{}');
      return store[key] !== undefined ? store[key] : null;
    } catch {
      return null;
    }
  },
  setItem(key, value) {
    ensureFile();
    try {
      const raw = fs.readFileSync(storageFile, 'utf-8');
      const store = JSON.parse(raw || '{}');
      store[key] = String(value);
      fs.writeFileSync(storageFile, JSON.stringify(store, null, 2), 'utf-8');
    } catch (err) {
      console.error('LocalStorage write error:', err);
    }
  },
  removeItem(key) {
    ensureFile();
    try {
      const raw = fs.readFileSync(storageFile, 'utf-8');
      const store = JSON.parse(raw || '{}');
      delete store[key];
      fs.writeFileSync(storageFile, JSON.stringify(store, null, 2), 'utf-8');
    } catch (err) {
      console.error('LocalStorage delete error:', err);
    }
  },
  clear() {
    ensureFile();
    fs.writeFileSync(storageFile, JSON.stringify({}, null, 2), 'utf-8');
  }
};

module.exports = localStorage;
