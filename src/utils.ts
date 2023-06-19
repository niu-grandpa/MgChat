import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';

dayjs.extend(isToday);
dayjs.extend(isYesterday);

export function getRegExp() {
  // 昵称要求1-12位字符，只能包含汉字/数字/字母和下划线
  const name = /^[\u4e00-\u9fa5a-zA-Z0-9]{1,12}$/;
  // 密码8-16个字符,不包含空格,必须包含数字,字母或字符至少两种
  const pwd =
    /(?!.*\s)(?!^[\u4e00-\u9fa5]+$)(?!^[0-9]+$)(?!^[A-z]+$)(?!^[^A-z0-9]+$)^.{8,16}$/;
  // 标准手机号码
  const phone = /^1(3\d|4[5-9]|5[0-35-9]|6[2567]|7[0-8]|8\d|9[0-35-9])\d{8}$/;

  return {
    pwd,
    name,
    phone,
  };
}

export function formatPhoneNumber(phone: string): string {
  return `${phone.slice(0, 3)}*****${phone.slice(8)}`;
}

export function formatDate(timestamp: number) {
  const now = dayjs(timestamp);
  const isTdy = now.isToday();
  const isYstd = now.isYesterday();

  return isTdy
    ? now.format('HH:mm')
    : isYstd
    ? '昨天'
    : now.format('YYYY/MM/DD');
}
