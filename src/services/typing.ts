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
  username: string;
};
