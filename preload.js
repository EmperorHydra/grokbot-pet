const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('pet', {
  overPet: (v) => ipcRenderer.send('mouse-over-pet', v),
  dragStart: () => ipcRenderer.send('drag-start'),
  dragMove: () => ipcRenderer.send('drag-move'),
  dragEnd: () => ipcRenderer.send('drag-end'),
  openChat: () => ipcRenderer.send('open-chat'),
  menu: () => ipcRenderer.send('context-menu'),
  onNotify: (cb) => ipcRenderer.on('notify', (_e, m) => cb(m))
});
