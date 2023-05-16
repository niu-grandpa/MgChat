import { BrowserWindow, IpcMainInvokeEvent, ipcMain, screen } from 'electron';

export default function winHandler(config: {
  url: string;
  preload: string;
  indexHtml: string;
  win: BrowserWindow | null;
  map: Map<string, BrowserWindow>;
}) {
  const { url, preload, indexHtml, map } = config;

  // New window example arg: new windows url
  ipcMain.handle('open-win', createChildWindow);
  ipcMain.handle('close-win', closeWindow);
  ipcMain.handle('resize-win', setWinSize);
  ipcMain.handle('set-position', setPosition);

  ipcMain.handle('min-win', (_: any, path: string) => {
    map.get(path)?.minimize();
  });

  ipcMain.handle('max-min', (_: any, path: string) => {
    const currentWin = map.get(path);
    currentWin?.isMaximized() ? currentWin.restore() : currentWin?.maximize();
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

    if (map.has(path)) {
      childWindow = map.get(path)!;
    } else {
      childWindow = new BrowserWindow({
        ...rest,
        webPreferences: {
          preload,
          nodeIntegration: true,
          contextIsolation: false,
        },
      });
      map.set(path, childWindow);
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

    if (!map.has(path)) return;
    const currentWin = map.get(path)!;

    if (destroy) {
      currentWin.destroy();
      map.delete(path);
    } else {
      onClose && currentWin.on('close', onClose);
      currentWin.close();
    }

    if (path === 'main') config.win = null;
  }

  // x坐标不需要传递，由屏幕宽度减去给定窗口宽度计算得出
  // 手动调整即可，确保在不同屏幕下位置正确
  function setPosition(
    _: any,
    params: { path: string; y: number; marginRight: number }
  ) {
    const { y, path, marginRight } = params;
    const { width } = screen.getPrimaryDisplay().workAreaSize;
    map.get(path)!.setPosition(width - marginRight, y, true);
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
    const cur = map.get(path)!;
    const [mw, mh] = cur.getMaximumSize();

    maxWidth && cur.setMaximumSize(mw, maxHeight);
    maxHeight && cur.setMaximumSize(mh, maxHeight);
    resizable && cur.setResizable(resizable);

    cur.setSize(width, height, true);
  }
}
