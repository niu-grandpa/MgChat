import { MessageRole, UserStatus } from './enum';

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
  friends: FriendInfo[];
  groups: GroupInfo[];
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

export type FriendInfo = {
  uid: string;
  icon: string;
  age: number;
  status: UserStatus;
  level: number;
  nickname: string;
  phoneNumber: string;
};

export type UserChatLogs = {
  uid: string;
  friend: string;
  icon: string;
  nickname: string;
  logs: {
    cid: string;
    role: MessageRole;
    content: string;
    image: string;
    hidden: boolean;
    isRead: boolean;
    createTime: number;
  }[];
};
