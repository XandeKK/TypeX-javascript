const { ipcMain } = require('electron');
const Store = require('electron-store');

const store = new Store();

function get(_event, key) {
	return store.get(key);
}

function set(_event, key, value) {
	store.set(key, value);
}

ipcMain.handle('electronStore:get', get);
ipcMain.handle('electronStore:set', set);