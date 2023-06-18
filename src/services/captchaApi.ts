import axios from 'axios';
import pkg from '../../package.json';

const URL = pkg.debug.env.SERVER_URL + '/api/captcha';

/**
 * 发送验证码
 * @param phoneNumber 手机号码
 */
export const send = async (phoneNumber: string) => {
  const { data } = await axios.post(`${URL}/send`, {
    data: { phoneNumber },
  });
  return data;
};
