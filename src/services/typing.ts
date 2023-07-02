import { MessageType, UserStatus } from './enum';

export type ResponseData<T> = Promise<{
  code: number;
  msg: string;
  data: T;
}>;

export type UserInfo = {
  icon: string;
  city: string;
  age: number;
  token: string;
  status: UserStatus;
  level: number;
  gender: number;
  credit: number;
  privilege: number;
  upgradeDays: number;
  nickname: string;
  uid: string;
  password: string;
  phoneNumber: string;
  timeInfo: {
    loginTime: number;
    logoutTime: number;
    activeTime: number;
    createTime: number;
    expiredTime: number;
  };
};

export type GroupInfo = {
  gid: number;
  name: string;
  owner: UserInfo;
  member: UserInfo[];
  createTime: number;
};

export type FriendList = {
  uid: string;
  list: UserInfo[];
};

export type MessageLogs = {
  uid: string;
  friend: string;
  /**好友头像 */
  icon: string;
  /**好友昵称 */
  nickname: string;
  /**与好友的聊天记录 */
  logs: MessageLogType[];
};

export type MessageLogType = {
  from: string;
  to: string;
  cid: string;
  image: string;
  content: string;
  read?: boolean;
  hidden?: boolean;
  createTime: number;
};

export type SendMessage = {
  from: string;
  to: string;
  icon: string;
  nickname: string;
  content?: string;
  image?: string;
  type: MessageType;
};

export type ReceivedMessage = {
  type: MessageType;
  icon: string;
  nickname: string;
  detail: {
    from: string;
    to: string;
    cid: string;
    content: string;
    image: string;
    createTime: number;
  };
};

export type FileMessageLogs = Record<string, MessageLogs> & {
  code: 200 | 404 | 500;
};
