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

type WinMap = Map<string, BrowserWindow>;

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
const indexHtml = join(process.env.DIST, 'index.html');
const [width, height] = pkg.debug.winSize;

class Client {
  private map: WinMap = new Map();

  private lru_cache: WinMap = new Map();

  /** keepAlive最大容量 */
  public capacity = 3;

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

  /**最小化窗口 */
  minimizeWin(_: any, { pathname }: { pathname: string }) {
    this.map.get(pathname)?.minimize();
  }

  /**最大化窗口 */
  maximizeWin(_: any, { pathname }: { pathname: string }) {
    this.map.get(pathname)?.maximize();
  }

  /**调整窗口尺寸 */
  resizeWin(_: any, { pathname, width, height, resizable }: CreateChildArgs) {
    const win = this.map.get(pathname);
    if (!win) return;

    const [originalW, originalH] = win.getContentSize();

    if (width) win.setSize(width, originalH, true);
    if (height) win.setSize(originalW, height, true);
    if (resizable !== undefined) win.setResizable(resizable);
  }

  /**
   * 调整窗口位置
   * left值由屏幕宽度减去给定的左差量
   */
  adjustWinPos(_: any, { top, center, pathname, leftDelta }: AdjustWinPosArgs) {
    const win = this.map.get(pathname);

    if (!win) return;
    if (center) {
      win.center();
      return;
    }

    const { width } = screen.getPrimaryDisplay().workAreaSize;
    win.setPosition(width - leftDelta, top, true);
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
      win?.webContents.send(
        'main-process-message',
        new Date().toLocaleString()
      );
    });

    // Make all links open with the browser, not with the application
    win.webContents.setWindowOpenHandler(({ url }) => {
      if (url.startsWith('https:')) shell.openExternal(url);
      return { action: 'deny' };
    });

    // Apply electron-updater
    update(win);

    return win;
  }

  /**
   * 创建其他窗口
   * @param _
   * @param param1
   */
  createOtherWin(_: any, { pathname, ...rest }: CreateChildArgs) {
    this.windowCreator(pathname, rest);
  }

  /**
   * 关闭窗口
   */
  closeWindow(_: any, { pathname, keepAlive, onClose }: CloseWindowArgs) {
    if (!this.map.has(pathname)) {
      console.error(`[Client] error: '${pathname}' dose not exist`);
      return;
    }

    const win = this.map.get(pathname)!;
    const callback = () => onClose && win.on('close', onClose);

    // 关闭主窗口，结束整个进程
    if (pathname === '/') {
      callback();
      app.emit('window-all-closed');
      return;
    }

    callback();

    // 关闭后转为后台存活
    if (keepAlive) {
      win.hide();
      this.keepWinAlive().put(pathname, win);
    } else {
      win.close();
      this.map.delete(pathname);
    }
  }

  /**
   * 使用lru缓存优化控制一定数量的窗口在后台存活
   *
   * 该算法直白描述就是：
   * 表中没访问过的元素原地站着，新来的和已存在的又被访问一次的都往后靠，
   * @returns
   */
  private keepWinAlive() {
    const cache = this.lru_cache;
    return {
      put(pathname: string, win: BrowserWindow) {
        // 重设为最近添加
        // 假如重设数字2：1 - 2 - 3 ---> 1 - 3 - 2
        if (cache.has(pathname)) cache.delete(pathname);
        cache.set(pathname, win);
      },

      get(pathname: string): BrowserWindow | null {
        if (!cache.has(pathname)) return null;
        const win = cache.get(pathname)!;
        this.put(pathname, win);
        return win;
      },

      /**
       * 内存回收
       *
       * 从表的头节点依次往后删除，直到不超容量
       */
      recycle: () => {
        while (cache.size > this.capacity) {
          const key = cache.keys().next().value;
          cache.get(key)!.close();
          cache.delete(key);
          this.map.delete(key);
        }
      },
    };
  }

  /**
   * 创建窗口
   * @param pathname 路由路径名
   * @param options BrowserWindow配置项
   * @returns BrowserWindow
   */
  windowCreator(
    pathname: string,
    options: BrowserWindowConstructorOptions
  ): BrowserWindow {
    // Map缓存优化
    if (this.map.has(pathname)) return this.map.get(pathname)!;

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

    this.loadPage(pathname, win);
    this.bindWithRoute(pathname, win);

    return win;
  }

  /**
   * 路由路径与窗口实例绑定
   * @param pathname
   * @param win
   */
  private bindWithRoute(pathname: string, win: BrowserWindow) {
    this.map.set(pathname, win);
  }

  /**
   * 通过修改窗口url地址加载页面
   * @param win
   * @param pathname
   */
  private loadPage(pathname: string, win: BrowserWindow) {
    const url = process.env.VITE_DEV_SERVER_URL;
    if (url) {
      // 改变窗口地址，顺势加载路由页面
      win.loadURL(url + pathname);
      // Open devTool if the app is not packaged
      win.webContents.openDevTools();
    } else {
      win.loadFile(indexHtml, pathname ? { hash: pathname } : {});
    }
  }

  /**
   * 清空关闭所有窗口
   */
  destroy() {
    this.map.forEach(win => win.close());
    this.map.clear();
  }
}

export default new Client();
