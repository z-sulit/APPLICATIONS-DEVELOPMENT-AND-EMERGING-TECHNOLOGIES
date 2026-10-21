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
//loc strg obj
const localStorage = {
  getItem(key) {
    ensureFile();
    // reads the file, parses it, and returns the value for the given key, or null kung not found...
    try {
      const raw = fs.readFileSync(storageFile, 'utf-8');
      const store = JSON.parse(raw || '{}');
      return store[key] !== undefined ? store[key] : null;
    } catch {
      return null;
    }
  },
  // writes the value for the given key to the file, creating or updating it as necessary
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
