import {
  BrowserWindow,
  IpcMainInvokeEvent,
  app,
  ipcMain,
  screen,
  shell,
} from 'electron';
import { release } from 'node:os';
import { join } from 'node:path';
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
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(process.env.DIST, 'index.html');

async function createMainWindow() {
  win = new BrowserWindow({
    title: 'Main window',
    icon: join(process.env.PUBLIC, 'favicon.ico'),
    frame: false,
    width: 330,
    height: 395,
    resizable: false,
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

  if (url) {
    // electron-vite-vue#298
    win.loadURL(url);
    // Open devTool if the app is not packaged
    win.webContents.openDevTools();
  } else {
    win.loadFile(indexHtml);
  }

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

// 创建新窗口需要有对应路由表配置的路径
function createChildWindow(
  _: IpcMainInvokeEvent,
  params: {
    path: string;
    title?: string;
    frame?: boolean;
    width?: number;
    height?: number;
  }
) {
  const { path, ...rest } = params;
  let childWindow: BrowserWindow | null;

  if (winMap.has(path)) {
    childWindow = winMap.get(path)!;
  } else {
    childWindow = new BrowserWindow({
      ...rest,
      webPreferences: {
        preload,
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
    winMap.set(path, childWindow);
  }

  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}${path}`);
    childWindow.webContents.openDevTools();
  } else {
    childWindow.loadFile(indexHtml, { hash: path });
  }
}

function closeWindow(
  _: any,
  params: { path: string; destroy?: boolean; onClose?: () => void }
) {
  const { path, destroy, onClose } = params;

  if (!winMap.has(path)) return;
  const currentWin = winMap.get(path)!;

  if (destroy) {
    currentWin.destroy();
    winMap.delete(path);
  } else {
    onClose && currentWin.on('close', onClose);
    currentWin.close();
  }

  if (path === 'main') win = null;
}

// x坐标不需要传递，由屏幕宽度减去给定窗口宽度计算得出
// 手动调整即可，确保在不同屏幕下位置正确
function setPosition(
  _: any,
  params: { path: string; y: number; marginRight: number }
) {
  const { y, path, marginRight } = params;
  const { width } = screen.getPrimaryDisplay().workAreaSize;
  winMap.get(path)?.setPosition(width - marginRight, y, true);
}

function setWinSize(
  _: any,
  params: {
    path: string;
    width: number;
    height: number;
    maxWidth: number;
    maxHeight: number;
    resizable: boolean;
  }
) {
  const { path, width, height, maxWidth, maxHeight, resizable } = params;
  const cur = winMap.get(path);
  cur?.setResizable(resizable);
  cur?.setSize(width, height, true);
  cur?.setMaximumSize(maxWidth, maxHeight);
}

// New window example arg: new windows url
ipcMain.handle('open-win', createChildWindow);
ipcMain.handle('close-win', closeWindow);
ipcMain.handle('resize-win', setWinSize);
ipcMain.handle('set-position', setPosition);
ipcMain.handle('min-win', (_: any, path: string) => {
  winMap.get(path)?.minimize();
});
ipcMain.handle('max-min', (_: any, path: string) => {
  const currentWin = winMap.get(path);
  currentWin?.isMaximized() ? currentWin.restore() : currentWin?.maximize();
});
ipcMain.handle('set-always-on-top', () => win?.setAlwaysOnTop(true));
