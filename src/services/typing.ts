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
  friends: FriendsInfo[];
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

export type FriendsInfo = {
  uid: string;
  icon: string;
  age: number;
  status: UserStatus;
  level: number;
  nickname: string;
  phoneNumber: string;
};

export type UserMessage = {
  who: string;
  icon: string;
  nickname: string;
  message: {
    role: MessageRole;
    content: string;
    image: string;
    hidden: boolean;
    createTime: number;
    cid: string;
    isRead: boolean;
  }[];
};
