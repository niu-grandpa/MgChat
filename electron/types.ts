import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';

export type CacheMap = Map<
  string,
  {
    instance: BrowserWindow;
    active: boolean;
    keepAlive?: boolean;
    expiredTime: number;
  }
>;

export type CreateChildArgs = {
  pathname: string;
} & BrowserWindowConstructorOptions;

export type CloseWindowArgs = {
  pathname: string;
  keepAlive: boolean;
  onClose?: () => void;
};

export type AdjustWinPosArgs = {
  top: number;
  pathname: string;
  center: boolean;
  leftDelta: number;
};

export type ChannelType =
  | 'open-win'
  | 'close-win'
  | 'resize-win'
  | 'minimize'
  | 'maximize'
  | 'adjust-win-pos'
  | 'load-friend-messages'
  | 'save-friend-messages';

export type SaveFriendMessages = {
  uid: string;
  icon: string;
  nickname: string;
  friend: string;
  data: string;
};
