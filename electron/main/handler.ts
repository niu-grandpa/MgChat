import {
  BrowserWindow,
  BrowserWindowConstructorOptions,
  IpcMainInvokeEvent,
  app,
  ipcMain,
  screen,
} from 'electron';

export default function winHandler(config: {
  preload: string;
  indexHtml: string;
  win: BrowserWindow | null;
  map: Map<string, BrowserWindow>;
}) {
  const { win, preload, indexHtml, map } = config;
  const LRU = createLRU()(3);

  // 创建子窗口，渲染的视图对应路由表配置的路由路径
  async function createChildWindow(
    _: IpcMainInvokeEvent,
    args: {
      key: string;
      alive?: boolean;
      search?: string;
    } & BrowserWindowConstructorOptions
  ) {
    const { key, alive, search, ...rest } = args;
    // key无法单纯的只用pathname，这样的话无法得到那些同个路径下不同参数的窗口，
    // 假如当打开的url路径含参时，说明需要创建新窗口而实际上是在同个路径下渲染不同内容
    const _key = key + (search ?? '');
    // 通过lru缓存激活假关闭的窗口
    if (alive && LRU.get(_key)) {
      LRU.get(_key)!.show();
      return;
    }

    const childWindow = new BrowserWindow({
      ...rest,
      parent: win!,
      autoHideMenuBar: true,
      webPreferences: {
        preload,
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    map.set(_key, childWindow);

    loadFile({ win: childWindow, key, indexHtml, search });

    childWindow.on('ready-to-show', childWindow.show);
  }

  function closeWindow(
    _: IpcMainInvokeEvent,
    args: {
      key: string;
      keepAlive?: boolean;
      destroy?: boolean;
      onClose?: () => void;
    }
  ) {
    const { key, keepAlive, destroy, onClose } = args;

    if (key === 'main') {
      app.emit('window-all-closed');
      return;
    }

    if (!map.has(key)) return;
    const tmp = map.get(key)!;

    if (destroy || !keepAlive) {
      destroy && tmp.destroy();
      map.delete(key);
    } else if (keepAlive) {
      tmp.hide();
      // 更新lru缓存的窗口
      LRU.put(key, tmp);
    } else {
      onClose && tmp.on('close', onClose);
      tmp.close();
    }
  }

  // x坐标不需要传递，由屏幕宽度减去给定窗口宽度计算得出
  // 手动调整即可，确保在不同屏幕下位置正确
  function setPosition(
    _: IpcMainInvokeEvent,
    args: { key: string; y: number; marginRight: number; center: boolean }
  ) {
    const { y, center, key, marginRight } = args;
    if (center) {
      map.get(key)?.center();
      return;
    }
    const { width } = screen.getPrimaryDisplay().workAreaSize;
    map.get(key)?.setPosition(width - marginRight, y, true);
  }

  function setWinSize(
    _: IpcMainInvokeEvent,
    args: {
      key: string;
    } & BrowserWindowConstructorOptions
  ) {
    const { key, width, height, maxWidth, maxHeight, resizable } = args;

    const tmp = map.get(key)!;
    tmp.setSize(width!, height!, true);

    const [mw, mh] = tmp.getMaximumSize();
    maxWidth && tmp.setMaximumSize(mw, maxWidth);
    maxHeight && tmp.setMaximumSize(mh, maxHeight);
    resizable && tmp.setResizable(resizable);
  }

  // New window example arg: new windows url
  ipcMain.on('open-win', createChildWindow);
  ipcMain.on('close-win', closeWindow);
  ipcMain.on('resize-win', setWinSize);
  ipcMain.on('set-position', setPosition);
  ipcMain.on('min-win', (_: IpcMainInvokeEvent, { key }: { key: string }) => {
    map.get(key)?.minimize();
  });
  ipcMain.on('max-win', (_: IpcMainInvokeEvent, { key }: { key: string }) => {
    const tmp = map.get(key);
    tmp?.isMaximized() ? tmp.restore() : tmp?.maximize();
  });
}

export function loadFile({
  win,
  key,
  indexHtml,
  search,
}: {
  win: BrowserWindow | null;
  key: string;
  indexHtml: string;
  search?: string;
}) {
  const url = process.env.VITE_DEV_SERVER_URL;
  if (url) {
    // 用于加载路由页面
    win?.loadURL(`${url}${key}${search ?? ''}`);
    // Open devTool if the app is not packaged
    win?.webContents.openDevTools();
  } else {
    win?.loadFile(indexHtml, key ? { hash: key } : {});
  }
}

function createLRU() {
  const map = new Map();
  return (capacity: number) => ({
    get(key: string): BrowserWindow | null {
      if (map.has(key)) {
        const tmp = map.get(key);
        map.delete(key);
        map.set(key, tmp);
        return tmp;
      }
      return null;
    },
    put(key: string, value: BrowserWindow) {
      if (map.has(key)) map.delete(key);
      map.set(key, value);
      if (map.size > capacity) {
        const old = map.keys().next().value;
        map.delete(old);
      }
    },
  });
}
