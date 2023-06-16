import axios from 'axios';

/**
 * 发送验证码
 * @param phoneNumber 手机号码
 */
export const send = async (phoneNumber: string) => {
  const { data } = await axios.post(`${URL}/captcha/send`, {
    data: { phoneNumber },
  });
  return data;
};
