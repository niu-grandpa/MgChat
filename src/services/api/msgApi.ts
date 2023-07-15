import axios from 'axios';
import pkg from '../../../package.json';
import { ResponseData } from '../typing';

const URL = pkg.debug.env.SERVER_URL + '/api/message';

/**
 * 同步用户聊天数据
 * @param uid
 */
export const syncUserMessage = async (uid: string): ResponseData<string> => {
  const { data } = await axios.get(`${URL}/sync-friend-messages`, {
    params: uid,
  });
  return data;
};

/**
 * 获取好友新消息
 * @param uid
 */
export const getNewFriendMessage = async (
  uid: string
): ResponseData<string> => {
  const { data } = await axios.get(`${URL}/new-friend-messages`, {
    params: uid,
  });
  return data;
};

/**
 * 设置好友消息已读
 * @param params
 */
export const actionRead = async (params: {
  uid: string;
  friend: string;
}): ResponseData<boolean> => {
  const { data } = await axios.post(`${URL}/action-read`, {
    data: params,
  });
  return data;
};
