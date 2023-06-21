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
const windowCache: WindowCache = new Map();
const keepAliveCache: ActiveWindowMap = new Map();
/**
 * 自己的Electron客户端子进程
 */
class ClientSubprocess {
  static indexHtml = '';

  /** keepAlive最大容量 */
  static capacity = 3;

  static url: string | undefined = '';

  /**
   * 使用lru缓存优化控制一定数量的窗口在后台存活
   *
   * 该算法直白描述就是：
   * 表中没访问过的元素原地站着，新来的和已存在的又被访问的都挪动位置往最后靠，
   * @returns
   */
  static lruCache = {
    has: (key: string) => keepAliveCache.has(key),

    put: (pathname: string, instance: BrowserWindow, active = false) => {
      // 当窗口关闭的时候执行lru，那么结果则是根据窗口关闭的先后顺序进行缓存和淘汰
      // 只能是根据越慢关闭的窗口来预判用户最近使用的频率比之前关闭的窗口使用程度更加新
      // 重设为最近添加，假如重设数字2：1 - 2 - 3 ---> 1 - 3 - 2
      if (keepAliveCache.has(pathname)) keepAliveCache.delete(pathname);
      keepAliveCache.set(pathname, instance);
      this.setInstanceCache(pathname, instance, active);
    },

    get(pathname: string): BrowserWindow | null {
      if (!keepAliveCache.has(pathname)) return null;
      const instance = keepAliveCache.get(pathname)!;
      this.put(pathname, instance, true);
      return instance;
    },

    /**
     * 内存回收
     * 从表的头节点依次往后删除，直到不超容量
     */
    recycle: () => {
      const { capacity, setInstanceCache } = this;
      while (keepAliveCache.size > capacity) {
        const { value: pathname } = keepAliveCache.keys().next();
        keepAliveCache.delete(pathname);
        setInstanceCache(pathname, keepAliveCache.get(pathname)!, false);
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
    active: boolean,
    onClose?: () => void
  ) {
    windowCache.set(pathname, {
      instance: win,
      active,
      expired: Date.now() + 15 * 60 * 1000,
      close: onClose,
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
   * 注册主线程自定义事件
   */
  registerListeners() {
    for (const channel in this.ipcMainEventMap) {
      // @ts-ignore
      ipcMain.on(channel, this.ipcMainEventMap[channel]);
    }
  }

  /**
   * 初始化一些配置
   * @param config
   */
  init(config: { indexHtml: string; capacity: number; url?: string }) {
    ClientSubprocess.url = config.url;
    ClientSubprocess.indexHtml = config.indexHtml;
    ClientSubprocess.capacity = config.capacity;
  }

  /**
   * 创建主窗口
   * @returns BrowserWindow
   */
  createMain(pathname: string): BrowserWindow {
    const win = ClientSubprocess.windowCreator(pathname, {
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

    ClientSubprocess.loadPage(pathname, win);

    return win;
  }

  /**
   * 创建其他窗口
   * @param _
   * @param param1
   */
  private createOtherWin(_: any, { pathname, ...rest }: CreateChildArgs) {
    const win = ClientSubprocess.windowCreator(pathname, rest);
    win.focus();
  }

  /**最小化窗口 */
  private minimizeWin(_: any, { pathname }: { pathname: string }) {
    const { instance } = windowCache.get(pathname)!;
    instance.isMinimized() ? instance.restore() : instance.minimize();
  }

  /**最大化窗口 */
  private maximizeWin(_: any, { pathname }: { pathname: string }) {
    const { instance } = windowCache.get(pathname)!;
    instance.isMaximized() ? instance.restore() : instance.maximize();
  }

  /**调整窗口尺寸 */
  private resizeWin(
    _: any,
    { pathname, width, height, resizable }: CreateChildArgs
  ) {
    const win = windowCache.get(pathname);
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
    const win = windowCache.get(pathname);
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
    const { lruCache, setInstanceCache } = ClientSubprocess;

    if (!windowCache.has(pathname)) {
      console.error(`[ClientSubprocess] error: '${pathname}' dose not exist`);
      return;
    }

    const { instance } = windowCache.get(pathname)!;

    // 关闭主窗口，结束整个进程
    if (pathname === '/') {
      app.emit('window-all-closed');
      return;
    }

    if (keepAlive) {
      // 窗口关闭后标记为活跃，避免被自动回收
      lruCache.put(pathname, instance);
    } else {
      // 标记为不活跃，等待后台定时自动回收
      setInstanceCache(pathname, instance, false, onClose);
    }

    instance.hide();
  }

  /**
   * 创建窗口
   * @param pathname 路由路径名
   * @param options BrowserWindow配置项
   * @returns BrowserWindow
   */
  static windowCreator(
    pathname: string,
    options: BrowserWindowConstructorOptions
  ): BrowserWindow {
    const { setInstanceCache, lruCache } = ClientSubprocess;

    // lru缓存优化
    if (lruCache.has(pathname)) {
      const instance = lruCache.get(pathname)!;
      instance.show();
      return instance;
    }
    // Map缓存优化
    if (windowCache.has(pathname)) {
      const { instance } = windowCache.get(pathname)!;
      setInstanceCache(pathname, instance, true);
      instance.show();
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
    ClientSubprocess.loadPage(pathname, win);

    return win;
  }

  /**
   * 通过修改窗口url地址加载页面
   * @param win
   * @param pathname
   */
  static loadPage(pathname: string, win: BrowserWindow) {
    const { url } = ClientSubprocess;
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
    try {
      windowCache.forEach(({ instance, close }) => {
        close && instance.on('close', close);
        instance.close();
      });
    } catch (error) {}
    keepAliveCache.clear();
    windowCache.clear();
  }

  /**
   * 清理缓存中不活跃的窗口，防止过度占用内存。
   * 场景：1.定时清理缓存。2.keppAlive没有达到触发回收的条件。
   * keepAlive的重要作用之一就是刷新窗口缓存的过期时间，相当于延长回收时间，
   * 而没有使用keepAlive则窗口关闭后虽然还缓存着，但它的过期时间在第一次关闭窗口时就已经定格
   */
  autoClearCache() {
    const clone = new Map([...windowCache]);
    const cleanup = () => {
      if (!clone.size) return;
      for (const [pathname, { instance, active, expired, close }] of clone) {
        // 只清理不活跃窗口和非主窗口
        if (pathname !== '/' && !active && expired < Date.now()) {
          close && instance.on('close', close);
          instance.close();
          windowCache.delete(pathname);
        }
      }
    };
    setInterval(cleanup, 2 * 60 * 1000);
  }
}

export default new ClientSubprocess();
