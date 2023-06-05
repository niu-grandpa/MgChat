export * as type from './type';

/**
 * 加密手机号码
 * @param phoneNumber 手机号码
 * @param code 验证码
 */
export function endcodePhoneNumber(phoneNumber: string, code: number): string {
  /**
   * 加密规则:
   * [手机末位][验证码][手机第2-3位][时间戳][手机第4-6位][两位随机数][手机第7-9位][两位随机数][手机第10位][手机首位]
   *
   * 例：15302541396 --> 648935368544005000402532413121
   */

  let token = '';

  token += phoneNumber[phoneNumber.length - 1];
  token += code.toString();
  token += phoneNumber.substring(1, 3);
  token += Date.now().toString();
  token += phoneNumber.substring(3, 6);
  token += ~~(Math.random() * 90) + 10;
  token += phoneNumber.substring(6, 9);
  token += ~~(Math.random() * 90) + 10;
  token += phoneNumber[phoneNumber.length - 2];
  token += phoneNumber[0];

  return token;
}
