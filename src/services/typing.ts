/** 登录表单项数据 */
export type LoginData = {
  account: string;
  password: string;
  auto: boolean;
  remember: boolean;
};

/**登录成功后返回的用户基本信息 */
export type UserLoginBaseInfo = {
  icon: string;
  online: boolean;
  nickname: string;
};

/**注册表单项数据s */
export type ResisterData = {
  nickname: string;
  password: string;
  phoneNumber: string;
  code: number;
};
