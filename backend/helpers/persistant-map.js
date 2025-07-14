const fs = require('fs');
const path = require('path');

class PersistentMap {
  constructor() {
    if (PersistentMap.instance) {
      return PersistentMap.instance; // Enforce singleton
    }

    this.filePath = path.join(__dirname, 'cookies.json');
    this.map = new Map();

    this._loadFromFile();

    PersistentMap.instance = this; // Save the instance
  }

  _loadFromFile() {
    if (fs.existsSync(this.filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
        this.map = new Map(Object.entries(data));
      } catch (err) {
        console.error('Failed to load data from file:', err);
      }
    }
  }

  _saveToFile() {
    const obj = Object.fromEntries(this.map);
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write data to file:', err);
    }
  }

  set(key, value) {
    this.map.set(key, value);
    this._saveToFile();
  }

  get(key) {
    return this.map.get(key);
  }

  has(key) {
    return this.map.has(key);
  }

  delete(key) {
    const result = this.map.delete(key);
    this._saveToFile();
    return result;
  }

  clear() {
    this.map.clear();
    this._saveToFile();
  }

  getAll() {
    return Object.fromEntries(this.map);
  }
}

// Export a single instance
module.exports = new PersistentMap();