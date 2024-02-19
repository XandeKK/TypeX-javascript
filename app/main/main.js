const { app, BrowserWindow } = require('electron/main');
const path = require('node:path');
const notification = require('../utils/notification');
require('../utils/electron_store');
require('../utils/file_system');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js')
    }
  });

  win.loadFile('app/renderer/index.html');

  notification.sendNotificationToRenderer = win.webContents.send.bind(win.webContents);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
