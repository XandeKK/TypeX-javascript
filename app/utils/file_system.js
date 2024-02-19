const { ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const util = require('util');

const _readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);

function existsSync(_event, path) {
	return fs.existsSync(path);
}

function readdir(_event, path) {
	return _readdir(path);
}

async function isDirectory(_event, path) {
	const stats = await stat(path);
	return stats.isDirectory();
}

function join(_event, path_0, path_1) {
	return path.join(path_0, path_1);
}

function basename(_event, _path) {
	return path.basename(_path, path.extname(_path));
}

ipcMain.handle('existsSync', existsSync);
ipcMain.handle('readdir', readdir);
ipcMain.handle('isDirectory', isDirectory);
ipcMain.handle('join', join);
ipcMain.handle('basename', basename);