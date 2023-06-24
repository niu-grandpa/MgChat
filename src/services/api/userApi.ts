import SECRET_KEY from '@/views/SECRET_KET';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import pkg from '../../../package.json';
import { UserGender } from '../enum';
import { ResponseData, UserInfo } from '../typing';

type GetUserData = {
  uid?: string;
  phoneNumber?: string;
};

type RegisterDataByPhone = {
  nickname: string;
  password: string;
  phoneNumber: string;
  code: string;
  gender: UserGender;
};

const URL = pkg.debug.env.SERVER_URL + '/api/user';

/**
 * 获取用户信息
 */
export const getUser = async (params: GetUserData): ResponseData<UserInfo> => {
  const { data } = await axios.get(`${URL}/info`, { params });
  return data;
};

/**
 * 通过手机号码快捷注册账号
 */
export const registerByPhone = async (
  params: RegisterDataByPhone
): ResponseData<UserInfo> => {
  const { data } = await axios.post(`${URL}/register`, { data: params });
  return data;
};

/**
 * token登录
 */
export const loginWithToken = async (token: string): ResponseData<UserInfo> => {
  const { data } = await axios.post(`${URL}/login-with-token`, {
    data: { token },
  });
  return data;
};

/**
 * 密码登录
 */
export const loginWithPwd = async (params: {
  uid: string;
  password: string;
}): ResponseData<UserInfo> => {
  params.password = jwt.sign({ password: params.password }, SECRET_KEY);
  const { data } = await axios.post(`${URL}/login-with-pwd`, {
    data: params,
  });
  return data;
};

/**
 * 手机号码登录
 */
export const loginWithMobile = async (params: {
  phoneNumber: string;
  code: string;
}): ResponseData<UserInfo> => {
  const { data } = await axios.post(`${URL}/login-with-phone`, {
    data: params,
  });
  return data;
};