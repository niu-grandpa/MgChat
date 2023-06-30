import { signData } from '@/utils';
import axios from 'axios';
import pkg from '../../../package.json';
import { MessageLogs, ResponseData } from '../typing';

const URL = pkg.debug.env.SERVER_URL + '/api/message';

/**
 * 储存聊天消息
 * @param params
 */
export const save = async (params: MessageLogs): ResponseData<number> => {
  const { data } = await axios.post(`${URL}/save`, {
    data: signData(params),
  });
  return data;
};
