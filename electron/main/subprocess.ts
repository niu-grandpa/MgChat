import {
  BrowserWindow,
  BrowserWindowConstructorOptions,
  app,
  ipcMain,
  screen,
  shell,
} from 'electron';
import { join } from 'node:path';
import pkg from '../../package.json';
import { update } from './update';

type WindowCache = Map<
  string,
  {
    instance: BrowserWindow;
    expired: number;
    active: boolean;
    close?: () => void;
  }
>;

type ActiveWindowMap = Map<string, BrowserWindow>;

type CreateChildArgs = {
  pathname: string;
} & BrowserWindowConstructorOptions;

type CloseWindowArgs = {
  pathname: string;
  keepAlive: boolean;
  onClose?: () => void;
};

type AdjustWinPosArgs = {
  top: number;
  pathname: string;
  center: boolean;
  leftDelta: number;
};

type ChannelType =
  | 'open-win'
  | 'close-win'
  | 'resize-win'
  | 'minimize'
  | 'maximize'
  | 'adjust-win-pos';

const preload = join(__dirname, '../preload/index.js');
const [width, height] = pkg.debug.winSize;

/**
 * 自己的Electron客户端子进程
 */
class ClientSubprocess {
  private indexHtml = '';

  /** keepAlive最大容量 */
  static capacity = 3;

  private url: string | undefined = '';

  static windowInstanceCache: WindowCache = new Map();

  static backgroundCache: ActiveWindowMap = new Map();

  /**
   * 使用lru缓存优化控制一定数量的窗口在后台存活
   *
   * 该算法直白描述就是：
   * 表中没访问过的元素原地站着，新来的和已存在的又被访问的都挪动位置往最后靠，
   * @returns
   */
  static keepAlive = {
    has: (key: string) => this.backgroundCache.has(key),

    put: (pathname: string, instance: BrowserWindow, active = false) => {
      const { backgroundCache, setInstanceCache } = this;

      // 重设为最近添加，假如重设数字2：1 - 2 - 3 ---> 1 - 3 - 2
      if (backgroundCache.has(pathname)) backgroundCache.delete(pathname);

      backgroundCache.set(pathname, instance);
      setInstanceCache(pathname, instance, active);
    },

    get(pathname: string): BrowserWindow | null {
      const { backgroundCache } = ClientSubprocess;

      if (!backgroundCache.has(pathname)) return null;
      const instance = backgroundCache.get(pathname)!;

      this.put(pathname, instance, true);

      return instance;
    },

    /**
     * 内存回收
     * 从表的头节点依次往后删除，直到不超容量
     */
    recycle: () => {
      const { backgroundCache, capacity, setInstanceCache } = this;

      while (backgroundCache.size > capacity) {
        const { value: pathname } = backgroundCache.keys().next();
        const instance = backgroundCache.get(pathname)!;

        instance.close();
        backgroundCache.delete(pathname);

        setInstanceCache(pathname, instance, false);
      }
    },
  };

  /**
   * 设置窗口实例缓存
   * @param pathname 路由路径名
   * @param win
   */
  static setInstanceCache(
    pathname: string,
    win: BrowserWindow,
    active: boolean
  ) {
    ClientSubprocess.windowInstanceCache.set(pathname, {
      instance: win,
      active,
      expired: Date.now() + 15 * 60 * 1000,
    });
  }

  private ipcMainEventMap: Record<ChannelType, any> = {
    'open-win': this.createOtherWin,
    'close-win': this.closeWindow,
    minimize: this.minimizeWin,
    maximize: this.maximizeWin,
    'resize-win': this.resizeWin,
    'adjust-win-pos': this.adjustWinPos,
  };

  /**
   * 初始化一些配置
   * @param config
   */
  init(config: { indexHtml: string; capacity: number; url?: string }) {
    this.url = config.url;
    this.indexHtml = config.indexHtml;
    ClientSubprocess.capacity = config.capacity;
  }

  /**
   * 创建主窗口
   * @returns BrowserWindow
   */
  createMain(pathname: string): BrowserWindow {
    const win = this.windowCreator(pathname, {
      width,
      height,
      title: 'Main window',
      resizable: false,
      alwaysOnTop: true,
    });

    // Test actively push message to the Electron-Renderer
    win.webContents.on('did-finish-load', () => {
      win.webContents.send('main-process-message', new Date().toLocaleString());
    });

    // Make all links open with the browser, not with the application
    win.webContents.setWindowOpenHandler(({ url }) => {
      if (url.startsWith('https:')) shell.openExternal(url);
      return { action: 'deny' };
    });

    // Apply electron-updater
    update(win);

    this.loadPage(pathname, win);

    return win;
  }

  /**
   * 创建其他窗口
   * @param _
   * @param param1
   */
  private createOtherWin(_: any, { pathname, ...rest }: CreateChildArgs) {
    const win = this.windowCreator(pathname, rest);
    this.loadPage(pathname, win);
  }

  /**
   * 注册主线程自定义事件
   */
  registerListeners() {
    for (const channel in this.ipcMainEventMap) {
      // @ts-ignore
      ipcMain.on(channel, this.ipcMainEventMap[channel]);
    }
  }

  /**最小化窗口 */
  private minimizeWin(_: any, { pathname }: { pathname: string }) {
    const { instance } = ClientSubprocess.windowInstanceCache.get(pathname)!;
    instance.minimize();
  }

  /**最大化窗口 */
  private maximizeWin(_: any, { pathname }: { pathname: string }) {
    const { instance } = ClientSubprocess.windowInstanceCache.get(pathname)!;
    instance.maximize();
  }

  /**调整窗口尺寸 */
  private resizeWin(
    _: any,
    { pathname, width, height, resizable }: CreateChildArgs
  ) {
    const win = ClientSubprocess.windowInstanceCache.get(pathname);
    if (!win) return;
    const { instance } = win;
    instance.setSize(width!, height!, true);
    if (resizable !== undefined) instance.setResizable(resizable);
  }

  /**
   * 调整窗口位置
   * left值由屏幕宽度减去给定的左差量
   */
  private adjustWinPos(
    _: any,
    { top, center, pathname, leftDelta }: AdjustWinPosArgs
  ) {
    const win = ClientSubprocess.windowInstanceCache.get(pathname);
    if (!win) return;
    const { instance } = win;
    if (center) {
      instance.center();
      return;
    }
    const { width } = screen.getPrimaryDisplay().workAreaSize;
    instance.setPosition(width - leftDelta, top, true);
  }

  /**
   * 关闭窗口
   */
  private closeWindow(
    _: any,
    { pathname, keepAlive, onClose }: CloseWindowArgs
  ) {
    const {
      windowInstanceCache,
      keepAlive: onKeepAlive,
      setInstanceCache,
    } = ClientSubprocess;

    if (!windowInstanceCache.has(pathname)) {
      console.error(`[ClientSubprocess] error: '${pathname}' dose not exist`);
      return;
    }

    const { instance } = windowInstanceCache.get(pathname)!;

    // 关闭主窗口，结束整个进程
    if (pathname === '/') {
      app.emit('window-all-closed');
      return;
    }

    // 当窗口关闭的时候执行lru，那么结果则是根据窗口关闭的先后顺序进行缓存和淘汰
    // 只能是根据越慢关闭来预判用户当前关闭的窗口，要比之前关闭的窗口使用程度更加新
    if (keepAlive) {
      instance.hide();
      onKeepAlive.put(pathname, instance);
    } else {
      instance.close();
      setInstanceCache(pathname, instance, false);
    }
  }

  /**
   * 创建窗口
   * @param pathname 路由路径名
   * @param options BrowserWindow配置项
   * @returns BrowserWindow
   */
  private windowCreator(
    pathname: string,
    options: BrowserWindowConstructorOptions
  ): BrowserWindow {
    const { windowInstanceCache, setInstanceCache, keepAlive } =
      ClientSubprocess;

    // lru缓存优化
    if (keepAlive.has(pathname)) {
      const instance = keepAlive.get(pathname)!;
      return instance;
    }
    // Map缓存优化
    if (windowInstanceCache.has(pathname)) {
      const { instance } = windowInstanceCache.get(pathname)!;
      setInstanceCache(pathname, instance, true);
      return instance;
    }

    const win = new BrowserWindow({
      ...options,
      frame: false,
      autoHideMenuBar: true,
      titleBarStyle: 'hidden',
      icon: join(process.env.PUBLIC, 'favicon.ico'),
      webPreferences: {
        preload,
        // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
        // Consider using contextBridge.exposeInMainWorld
        // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    setInstanceCache(pathname, win, true);

    return win;
  }

  /**
   * 通过修改窗口url地址加载页面
   * @param win
   * @param pathname
   */
  private loadPage(pathname: string, win: BrowserWindow) {
    const { url } = this;
    pathname = pathname.replace('/', '');
    if (url) {
      // 改变窗口地址，顺势加载路由页面
      win.loadURL(url + pathname);
      // Open devTool if the app is not packaged
      win.webContents.openDevTools();
    } else {
      win.loadFile(this.indexHtml, pathname ? { hash: pathname } : {});
    }
  }

  /**
   * 销毁所有窗口
   */
  destroy() {
    const { windowInstanceCache, backgroundCache } = ClientSubprocess;
    windowInstanceCache.forEach(({ instance, close }) => {
      close && instance.on('close', close);
      instance.close();
    });
    backgroundCache.clear();
    windowInstanceCache.clear();
  }

  /**
   * 定时清理缓存中长时间不活跃的窗口，防止过度占用内存
   */
  autoClearCache() {
    const list = ClientSubprocess.windowInstanceCache;
    const { backgroundCache, windowInstanceCache } = ClientSubprocess;

    const cleanup = () => {
      if (!list.size) return;
      for (const [pathname, { instance, active, expired, close }] of list) {
        if (pathname !== '/' && !active && expired < Date.now()) {
          close && instance.on('close', close);
          instance.close();
          backgroundCache.delete(pathname);
          windowInstanceCache.delete(pathname);
        }
      }
    };

    setInterval(cleanup, 3 * 60 * 1000);
  }
}

export default new ClientSubprocess();
