const { app, BrowserWindow, Menu, clipboard, globalShortcut, ipcMain, screen, shell } = require('electron');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { subscribe, publish } = require('./ntfy');

const BASE_W = 260, BASE_H = 170;
const SIZES = { small: 0.75, medium: 1, large: 1.4 }; // medium = 72px ball
const stateFile = () => path.join(app.getPath('userData'), 'pet-state.json');

let win, drag = null, sub = null;
let state = { x: null, y: null, size: 'medium', muted: false };
let config = { topic: '', server: 'https://ntfy.sh', sound: true, clickUrl: '' };
const configFile = () => path.join(app.getPath('userData'), 'config.json');

function loadJson(f, fallback) { try { return { ...fallback, ...JSON.parse(fs.readFileSync(f, 'utf8')) }; } catch (_) { return fallback; } }
function saveState() { try { fs.writeFileSync(stateFile(), JSON.stringify(state)); } catch (_) {} }
function dims() { const s = SIZES[state.size] || 1; return { w: Math.round(BASE_W * s), h: Math.round(BASE_H * s), s }; }
function onScreen(x, y, w, h) {
  return screen.getAllDisplays().some(d => { const b = d.workArea;
    return x + w > b.x + 20 && x < b.x + b.width - 20 && y + h > b.y + 20 && y < b.y + b.height - 20; });
}

function createWindow() {
  const { w, h, s } = dims();
  const wa = screen.getPrimaryDisplay().workArea;
  let { x, y } = state;
  if (x == null || y == null || !onScreen(x, y, w, h)) { x = wa.x + wa.width - w - 30; y = wa.y + wa.height - h - 10; }
  win = new BrowserWindow({
    x, y, width: w, height: h, transparent: true, frame: false, hasShadow: false, resizable: false,
    alwaysOnTop: true, skipTaskbar: true, fullscreenable: false,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true }
  });
  win.setAlwaysOnTop(true, 'screen-saver');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.setIgnoreMouseEvents(true, { forward: true });
  win.loadFile('index.html');
  win.webContents.on('did-finish-load', () => win.webContents.setZoomFactor(s));
}

function setSize(name) {
  state.size = name;
  const { w, h, s } = dims();
  const b = win.getBounds();
  const nx = Math.round(b.x + b.width / 2 - w / 2), ny = b.y + b.height - h; // keep bottom-centre
  win.setBounds({ x: nx, y: ny, width: w, height: h });
  win.webContents.setZoomFactor(s);
  state.x = nx; state.y = ny; saveState();
}

function toggle() { if (win) (win.isVisible() ? win.hide() : win.showInactive()); }

function notify(m) {
  if (!win) return;
  if (!state.muted && config.sound !== false) shell.beep();
  win.webContents.send('notify', { title: m.title, message: m.message });
  if (!win.isVisible()) win.showInactive();
}

function loadConfig() {
  // Defaults ship inside the app (config.default.json); the user's editable copy lives in userData.
  const defaults = loadJson(path.join(__dirname, 'config.default.json'), config);
  config = loadJson(configFile(), defaults);
  let changed = !fs.existsSync(configFile());
  if (!config.topic) { config.topic = 'grokbot-pet-' + crypto.randomBytes(12).toString('hex'); changed = true; } // first launch
  if (changed) { try { fs.mkdirSync(app.getPath('userData'), { recursive: true }); fs.writeFileSync(configFile(), JSON.stringify(config, null, 2)); } catch (_) {} }
}

function startSubscriber() {
  if (sub) sub.stop();
  sub = subscribe({ server: config.server, topic: config.topic, onMessage: notify, onStatus: s => console.log('[ntfy]', s) });
}

function showMenu() {
  Menu.buildFromTemplate([
    { label: 'Send test notification', click: () =>
        publish(config.server, config.topic, 'Test notification: the pet is working', 'Grok Bot Pet').catch(e => console.log('test failed', e.message)) },
    { label: 'Copy my notification URL', click: () => clipboard.writeText(`${config.server.replace(/\/$/, '')}/${config.topic}`) },
    { label: 'Open config file', click: () => shell.openPath(configFile()) },
    { label: 'Mute sounds', type: 'checkbox', checked: !!state.muted, click: (i) => { state.muted = i.checked; saveState(); } },
    { label: 'Size', submenu: Object.keys(SIZES).map(n => ({
        label: n[0].toUpperCase() + n.slice(1), type: 'radio', checked: state.size === n, click: () => setSize(n) })) },
    { label: 'Hide pet (Option+Space to show)', click: () => win.hide() },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() }
  ]).popup({ window: win });
}

ipcMain.on('mouse-over-pet', (_e, over) => { if (!drag && win) win.setIgnoreMouseEvents(!over, { forward: true }); });
ipcMain.on('drag-start', () => { const b = win.getBounds(), p = screen.getCursorScreenPoint(); drag = { ox: p.x - b.x, oy: p.y - b.y }; });
ipcMain.on('drag-move', () => { if (drag) { const p = screen.getCursorScreenPoint(); win.setPosition(Math.round(p.x - drag.ox), Math.round(p.y - drag.oy)); } });
ipcMain.on('drag-end', () => { if (!drag) return; drag = null; const [x, y] = win.getPosition(); state.x = x; state.y = y; saveState(); });
ipcMain.on('open-chat', () => { if (config.clickUrl) shell.openExternal(config.clickUrl).catch(() => {}); });
ipcMain.on('context-menu', showMenu);

if (!app.requestSingleInstanceLock()) app.quit();
app.whenReady().then(() => {
  if (process.platform === 'darwin' && app.dock) app.dock.hide();
  state = loadJson(stateFile(), state);
  if (!SIZES[state.size]) state.size = 'medium';
  loadConfig();
  createWindow();
  startSubscriber();
  globalShortcut.register('Alt+Space', toggle);
});
app.on('will-quit', () => { globalShortcut.unregisterAll(); if (sub) sub.stop(); });
app.on('window-all-closed', () => app.quit());
