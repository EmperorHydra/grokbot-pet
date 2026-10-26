const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('setup', {
  get: () => ipcRenderer.invoke('setup-get'),
  copy: (t) => ipcRenderer.send('setup-copy', t),
  test: () => ipcRenderer.invoke('setup-test'),
  saveClick: (v) => ipcRenderer.invoke('setup-save-click', v),
  done: () => ipcRenderer.send('setup-done')
});
