import axios from 'axios';
import pkg from '../../../package.json';
import { ResponseData } from '../typing';

const URL = pkg.debug.env.SERVER_URL + '/api/message';

/**
 * 同步用户聊天数据
 * @param uid
 */
export const syncUserMessage = async (uid: string): ResponseData<string> => {
  const { data } = await axios.get(`${URL}/sync-friend-message`, {
    params: uid,
  });
  return data;
};
