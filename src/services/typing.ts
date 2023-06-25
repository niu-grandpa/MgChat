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
  logs: ReceivedMessage[];
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
  from: string;
  to: string;
  cid: string;
  detail: {
    icon: string;
    nickname: string;
    content: string;
    image: string;
  };
  createTime: number;
};
