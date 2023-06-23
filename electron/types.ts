import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';

export type WindowCache = Map<
  string,
  {
    instance: BrowserWindow;
    expired: number;
    active: boolean;
    close?: () => void;
  }
>;

export type ActiveWindowMap = Map<string, BrowserWindow>;

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
  | 'get-chat-logs'
  | 'post-chat-logs';

export type WriteUserDataType = {
  write: any;
  filename: string;
  dataKey: string;
};
