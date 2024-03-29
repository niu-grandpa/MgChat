import {
  BrowserWindow,
  BrowserWindowConstructorOptions,
  IpcMainEvent,
  app,
  ipcMain,
  screen,
  shell,
} from 'electron';
import {
  AdjustWinPosArgs,
  CacheMap,
  ChannelType,
  CloseWindowArgs,
  CreateChildArgs,
  SaveFriendMessages,
} from 'electron/types';
import fs from 'node:fs';
import { join } from 'node:path';
import pkg from '../../package.json';
import { MessageLogType, MessageLogs } from '../../src/services/typing';
import { update } from './update';
import { decrypt, encrypt } from './utils';

const preload = join(__dirname, '../preload/index.js');
const [width, height] = pkg.debug.winSize;

const messageInitValue = '{}';

/**
 * 自己的Electron客户端子进程
 */
class Subprocess {
  protected cacheMap: CacheMap = new Map();

  /** keepAlive最大容量 */
  private capacity = 4;

  private indexHtml = '';

  private url: string | undefined = '';

  /**
   * 缓存定额的窗口数量在内存中，实现后台存活。
   * keepAlive的作用是保证窗口能被复用而不是关闭后直接销毁，
   * 每次关闭窗口后都会延长缓存的过期时间，而关闭窗口的次数越少，
   * 被自动回收的可能性就越大。
   */
  private lru = {
    has: (key: string) => this.cacheMap.has(key),
    get: (pathname: string, active = true): BrowserWindow | null => {
      const { cacheMap } = this;
      const cache = cacheMap.get(pathname);
      if (cache?.instance) {
        // 标记为活跃状态
        cacheMap.set(pathname, {
          ...cache,
          active,
        });
        return cache.instance;
      }
      return null;
    },
    put: (
      pathname: string,
      instance: BrowserWindow,
      active = false,
      keepAlive = true
    ) => {
      const { cacheMap, lru } = this;
      const obj = { instance, active, keepAlive };
      const newExpiredTime = Date.now() + 15 * 60 * 1000;

      if (keepAlive) {
        // 更新在表中的位置，刷新过期时间
        lru.has(pathname) && cacheMap.delete(pathname);
        cacheMap.set(pathname, {
          ...obj,
          expiredTime: newExpiredTime,
        });
      } else {
        let expiredTime = newExpiredTime;
        if (lru.has(pathname)) {
          // 没有keepalvie则使用旧的过期时间
          const { expiredTime: oldTime } = cacheMap.get(pathname)!;
          expiredTime = oldTime;
        }
        cacheMap.set(pathname, {
          ...obj,
          expiredTime,
        });
      }
    },
    recycle: () => {
      const { cacheMap, capacity } = this;
      while (cacheMap.size > capacity) {
        // 获取哈希表第一个key进行删除
        const { value } = cacheMap.keys().next();
        cacheMap.get(value)!.instance.close();
        cacheMap.delete(value);
      }
    },
  };

  /**
   * 自动清理后台长时间不活跃的缓存，释放内存资源。
   * 用于解决某些特定情况，例如窗口被keepAlive后由于没有达到触发回收的条件,
   * 可能是打开的窗口过少或缓存容量较大，且长时间未使用导致它留在后台占用内存，
   * 此时就需要将其清理掉。
   */
  autoClearCache() {
    const { cacheMap } = this;
    const cloneMap = new Map([...cacheMap]);
    const cleanup = () => {
      if (!cloneMap.size) return;
      for (const [pathname, value] of cloneMap) {
        const { instance, active, keepAlive, expiredTime } = value;
        // 只清理已过期的不活跃窗口和非主窗口
        if (
          pathname !== '/' &&
          pathname !== '/user' &&
          !active &&
          expiredTime < Date.now()
        ) {
          instance.close();
          cacheMap.delete(pathname);
        }
      }
    };
    setInterval(cleanup, 1 * 60 * 1000);
  }

  /**
   * 通过修改窗口url地址加载页面
   * @param win
   * @param pathname
   */
  private loadPage(pathname: string, win: BrowserWindow) {
    const { url, indexHtml } = this;
    pathname = pathname.replace('/', '');
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
   * 创建窗口
   * @param pathname 路由路径名
   * @param options BrowserWindow配置项
   * @returns BrowserWindow
   */
  private createWindow = (
    pathname: string,
    options: BrowserWindowConstructorOptions & { useCache?: boolean }
  ): BrowserWindow => {
    const { lru } = this;

    options.useCache = options.useCache ?? true;

    // 缓存优化
    if (lru.has(pathname)) {
      const instance = lru.get(pathname)!;
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

    this.loadPage(pathname, win);

    lru.put(pathname, win, true, options.useCache);

    return win;
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
    this.url = config.url;
    this.indexHtml = config.indexHtml;
    this.capacity = config.capacity;
  }

  /**
   * 创建主窗口
   * @returns BrowserWindow
   */
  createMain = (pathname: string): BrowserWindow => {
    const win = this.createWindow(pathname, {
      width,
      height,
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

    return win;
  };

  /**
   * 创建子窗口
   * @param _
   * @param param1
   */
  private createSubWindow = (
    _: any,
    { pathname, ...rest }: CreateChildArgs
  ) => {
    const win = this.createWindow(pathname, rest);
    win.focus();
  };

  /**
   * 关闭窗口
   */
  private onCloseWindow = (
    _: any,
    { pathname, keepAlive }: CloseWindowArgs
  ) => {
    // 关闭主窗口，结束整个进程
    if (pathname === '/' || pathname === '/user') {
      app.emit('window-all-closed');
      return;
    }

    const { lru, cacheMap } = this;

    const instance = cacheMap.get(pathname)?.instance;

    if (!instance) return;
    if (keepAlive) {
      lru.put(pathname, instance);
      instance.hide();
    } else {
      instance.close();
      cacheMap.delete(pathname);
    }
  };

  /**
   * 销毁所有窗口
   */
  destroyAll() {
    const { cacheMap } = this;
    const instances = Array.from(cacheMap.values());
    while (instances.length) {
      instances.pop()?.instance.close();
    }
    cacheMap.clear();
  }

  /**最小化窗口 */
  private onMinimizeWin = (_: any, { pathname }: { pathname: string }) => {
    const { instance } = this.cacheMap.get(pathname)!;
    instance.isMinimized() ? instance.restore() : instance.minimize();
  };

  /**最大化窗口 */
  private onMaximizeWin = (_: any, { pathname }: { pathname: string }) => {
    const { instance } = this.cacheMap.get(pathname)!;
    instance.isMaximized() ? instance.restore() : instance.maximize();
  };

  /**调整窗口尺寸 */
  private onResizeWin = (
    _: any,
    { pathname, width, height, resizable }: CreateChildArgs
  ) => {
    const cache = this.cacheMap.get(pathname);
    if (!cache) return;
    const { instance } = cache;
    instance.setSize(width!, height!, true);
    if (resizable !== undefined) instance.setResizable(resizable);
  };

  /**
   * 调整窗口位置
   * left值由屏幕宽度减去给定的左差量
   */
  private onAdjustPos = (
    _: any,
    { top, center, pathname, leftDelta }: AdjustWinPosArgs
  ) => {
    const cache = this.cacheMap.get(pathname);
    if (!cache) return;
    const { instance } = cache;
    if (center) {
      instance.center();
      return;
    }
    const { width } = screen.getPrimaryDisplay().workAreaSize;
    instance.setPosition(width - leftDelta, top, true);
  };

  /**
   * 保存好友聊天消息
   * @param event
   * @param data
   *
   * 文件结构
   *
   * ├─┬ user_message
   * │ ├─┬ uid.txt 存放加密后的聊天数据
   * │   ├─┬ Map<<friend>,MessageLogs> 解密后的数据结构
   */
  private saveFriendMessages(event: IpcMainEvent, params: SaveFriendMessages) {
    const { uid, friend, data, nickname, icon } = params;
    const msgData: MessageLogs | MessageLogType[] = JSON.parse(data);

    const folderPath1 = join(__dirname, 'user_message');
    const filePath = join(folderPath1, `${uid}.txt`);

    if (!fs.existsSync(folderPath1)) {
      fs.mkdirSync(folderPath1, { recursive: true });
    } else if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, messageInitValue);
    }

    fs.readFile(filePath, 'utf-8', (err, res) => {
      if (err) {
        event.sender.send('save-friend-messages-fail');
        return;
      }

      let map: Map<string, MessageLogs> = new Map();

      if (res !== messageInitValue) {
        const source = decrypt<Map<string, MessageLogs>>(res);

        if (source === null) {
          event.sender.send('save-friend-messages-fail');
          return;
        }

        const target = source.get(friend);

        if (target) {
          // type=MessageLogs 渲染进程那边同步合并后的消息，直接覆盖数据
          if (!Array.isArray(msgData)) {
            source.set(friend, msgData);
          } else {
            // type=MessageLogType[] 说明有新数据要保存
            target.logs.push(...msgData);
          }
        } else {
          // 首次创建数据
          if (Array.isArray(msgData)) {
            const newVal: MessageLogs = {
              uid,
              friend,
              icon,
              nickname,
              logs: [...msgData],
            };
            source.set(friend, newVal);
          } else {
            source.set(friend, msgData);
          }
        }

        map = new Map([...source]);
      }

      fs.writeFile(
        filePath,
        encrypt(map),
        err => err && event.sender.send('save-friend-messages-fail')
      );
    });
  }

  /**
   * 加载所有好友聊天消息
   * @param event
   * @param uid 通过用户uid查询
   */
  private loadAllFriendMessages(event: IpcMainEvent, uid: string) {
    const folderPath1 = join(__dirname, 'user_message');
    const filePath = join(folderPath1, `${uid}.txt`);

    if (!fs.existsSync(filePath)) {
      event.sender.send('get-friend-messages', { code: 404 });
      return;
    }

    fs.readFile(filePath, 'utf-8', (err, token: string) => {
      if (err) {
        event.sender.send('get-friend-messages', { code: 500 });
        return;
      }
      const result = decrypt<string>(token);
      if (result !== null) {
        event.sender.send('get-friend-messages', {
          code: 200,
          data: result,
        });
      }
    });
  }

  private ipcMainEventMap: Record<ChannelType, Function> = {
    'open-win': this.createSubWindow,
    'close-win': this.onCloseWindow,
    minimize: this.onMinimizeWin,
    maximize: this.onMaximizeWin,
    'resize-win': this.onResizeWin,
    'adjust-win-pos': this.onAdjustPos,
    'load-friend-messages': this.loadAllFriendMessages,
    'save-friend-messages': this.saveFriendMessages,
  };
}

export default new Subprocess();
