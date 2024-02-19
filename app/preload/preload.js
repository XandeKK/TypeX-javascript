const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('notificationAPI', {
  onGetNotification: (callback) => ipcRenderer.on('notification', (_event, value) => callback(value)),
  getStatus: () => ipcRenderer.invoke('getStatus')
});

contextBridge.exposeInMainWorld('electronStoreAPI', {
  set: (key, value) => ipcRenderer.invoke('electronStore:set', key, value),
  get: (key) => ipcRenderer.invoke('electronStore:get', key)
});

contextBridge.exposeInMainWorld('FileSystemAPI', {
  existsSync: (path) => ipcRenderer.invoke('existsSync', path),
  readdir: (path) => ipcRenderer.invoke('readdir', path),
  isDirectory: (path) => ipcRenderer.invoke('isDirectory', path),
  join: (path_0, path_1) => ipcRenderer.invoke('join', path_0, path_1),
  basename: (path) => ipcRenderer.invoke('basename', path),
});