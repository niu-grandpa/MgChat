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

export type UserChatLogs = {
  uid: string;
  friend: string;
  icon: string;
  nickname: string;
  logs: ReceivedMessage['detail'] & { hidden: boolean; read: boolean };
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
  detail: {
    cid: string;
    icon: string;
    nickname: string;
    content: string;
    image: string;
  };
  createTime: number;
};
