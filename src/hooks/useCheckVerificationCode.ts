import { useRef } from 'react';

type Data = Record<
  string,
  {
    code: string[];
    endTime: number[];
  }
>;

/**检查手机验证码是否过期 */
export function useCheckVerificationCode() {
  const map = useRef<Data>({});
  return {
    set() {},
    expired(key: string): boolean {},
    associate(phone: string) {},
  };
}
