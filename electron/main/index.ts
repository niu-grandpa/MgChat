import { BrowserWindow, app, shell } from 'electron';
import { release } from 'node:os';
import { join } from 'node:path';
import pkg from '../../package.json';
import winHandler, { loadFile } from './handler';
import { update } from './update';

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, '../');
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist');
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, '../public')
  : process.env.DIST;

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null;
// 存储所有创建的窗口，key为路由路径并且对应的value为它所创建的窗口
const winMap = new Map<string, BrowserWindow>();
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js');
const indexHtml = join(process.env.DIST, 'index.html');
const [width, height] = pkg.debug.winSize;

async function createMainWindow() {
  win = new BrowserWindow({
    width,
    height,
    title: 'Main window',
    icon: join(process.env.PUBLIC, 'favicon.ico'),
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  loadFile({
    win,
    pathname: '',
    indexHtml,
  });

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString());
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url);
    return { action: 'deny' };
  });

  winMap.set('main', win);

  // Apply electron-updater
  update(win);
}

app.whenReady().then(createMainWindow);

app.on('window-all-closed', () => {
  win = null;
  winMap.clear();
  if (process.platform !== 'darwin') app.quit();
});

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createMainWindow();
  }
});

winHandler({
  win,
  preload,
  indexHtml,
  map: winMap,
});
