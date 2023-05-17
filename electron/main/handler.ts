import {
  BrowserWindow,
  BrowserWindowConstructorOptions,
  IpcMainInvokeEvent,
  ipcMain,
  screen,
} from 'electron';

export function loadFile({
  win,
  pathname,
  indexHtml,
}: {
  win: BrowserWindow | null;
  pathname: string;
  indexHtml: string;
}) {
  const url = process.env.VITE_DEV_SERVER_URL;
  if (url) {
    // 用于加载路由页面
    win?.loadURL(`${url}${pathname}`);
    // Open devTool if the app is not packaged
    win?.webContents.openDevTools();
  } else {
    win?.loadFile(indexHtml, pathname ? { hash: pathname } : {});
  }
}

export default function winHandler(config: {
  preload: string;
  indexHtml: string;
  win: BrowserWindow | null;
  map: Map<string, BrowserWindow>;
}) {
  const { win, preload, indexHtml, map } = config;

  // New window example arg: new windows url
  ipcMain.handle('open-win', createChildWindow);
  ipcMain.handle('close-win', closeWindow);
  ipcMain.handle('resize-win', setWinSize);
  ipcMain.handle('set-position', setPosition);

  ipcMain.handle('min-win', (_: any, pathname: string) => {
    map.get(pathname)?.minimize();
  });

  ipcMain.handle('max-min', (_: any, pathname: string) => {
    const currentWin = map.get(pathname);
    currentWin?.isMaximized() ? currentWin.restore() : currentWin?.maximize();
  });

  // 创建子窗口，渲染的视图对应路由表配置的路由路径
  function createChildWindow(
    _: IpcMainInvokeEvent,
    params: {
      pathname: string;
    } & BrowserWindowConstructorOptions
  ) {
    const { pathname, ...rest } = params;
    const childWindow = new BrowserWindow({
      ...rest,
      parent: win!,
      alwaysOnTop: true,
      autoHideMenuBar: true,
      webPreferences: {
        preload,
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
    map.set(pathname, childWindow);
    loadFile({ win: childWindow, pathname, indexHtml });
    childWindow.on('ready-to-show', childWindow.show);
  }

  function closeWindow(
    _: any,
    params: { pathname: string; destroy?: boolean; onClose?: () => void }
  ) {
    const { pathname, destroy, onClose } = params;

    if (!map.has(pathname)) return;
    const currentWin = map.get(pathname)!;
    if (destroy) {
      currentWin.destroy();
    } else {
      onClose && currentWin.on('close', onClose);
      currentWin.close();
    }
    map.delete(pathname);
    if (pathname === 'main') config.win = null;
  }

  // x坐标不需要传递，由屏幕宽度减去给定窗口宽度计算得出
  // 手动调整即可，确保在不同屏幕下位置正确
  function setPosition(
    _: any,
    params: { pathname: string; y: number; marginRight: number }
  ) {
    const { y, pathname, marginRight } = params;
    const { width } = screen.getPrimaryDisplay().workAreaSize;
    map.get(pathname)!.setPosition(width - marginRight, y, true);
  }

  function setWinSize(
    _: any,
    params: {
      pathname: string;
    } & BrowserWindowConstructorOptions
  ) {
    const { pathname, width, height, maxWidth, maxHeight, resizable } = params;

    const cur = map.get(pathname)!;
    cur.setSize(width!, height!, true);

    const [mw, mh] = cur.getMaximumSize();
    maxWidth && cur.setMaximumSize(mw, maxWidth);
    maxHeight && cur.setMaximumSize(mh, maxHeight);
    resizable && cur.setResizable(resizable);
  }
}
