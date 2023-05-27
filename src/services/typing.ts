/**聊天角色 */
export const enum MessageRoles {
  'ME',
  'OTHER',
}

/** 登录表单项数据 */
export type LoginData = {
  account: string;
  password: string;
  auto: boolean;
  remember: boolean;
};

/**登录成功后返回的用户基本信息 */
export type LoginResponse = {
  icon: string;
  online: boolean;
  nickname: string;
};

/**注册表单项数据 */
export type ResisterData = {
  account?: string;
  nickname: string;
  password: string;
  phoneNumber: string;
  code: number;
};

/**修改密码表单项数据 */
export type ChangePassword = {
  phoneNumber: string;
  password: string;
  code: string;
};

/**获取验证码 */
export type VerificationCode = {
  phoneNumber: string;
  code: string;
  endTime: number;
};

/**列表 */
export type BaseList = {
  uid: number;
  icon: string;
  name: string;
};

/**好友列表 */
export type FriendsList = {
  gender: 'm' | 'w' | 'none';
} & BaseList;

/**用户消息列表 */
export type UserMsgList = {
  timestamp: number;
  content: string[];
} & FriendsList;

/**群组列表 */
export type Groupist = BaseList;

export type MessageData = {
  role: MessageRoles;
  icon?: string;
  content: string;
  images: string[];
  timestamp: number;
};
