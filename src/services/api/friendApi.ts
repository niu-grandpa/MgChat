import axios from 'axios';
import pkg from '../../../package.json';
import { FriendList, ResponseData } from '../typing';

const URL = pkg.debug.env.SERVER_URL + '/api/friend';

/**
 * 查询好友列表
 * @param phoneNumber
 */
export const list = async (params: {
  uid?: string;
  phoneNumber?: string;
}): ResponseData<FriendList> => {
  const { data } = await axios.get(`${URL}/list`, {
    data: params,
  });
  return data;
};
