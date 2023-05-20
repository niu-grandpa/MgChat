import { message } from 'antd';

type MapType = Map<
  string,
  {
    code: Set<string>;
    endTime: Set<number>;
  }
>;

let map: MapType;

/**检查手机验证码是否过期 */
export function useCheckVerificationCode() {
  return {
    set(key: string, val: string, time: number) {
      if (!map.has(key)) map.set(key, { code: new Set(), endTime: new Set() });
      const { code, endTime } = map.get(key)!;
      code.add(val);
      endTime.add(time);
      map.set(key, { code, endTime });
    },
    expired(key: string, val: string): boolean {
      const { code, endTime } = map.get(key)!;
      let time = 0;
      Array.from(code.values()).forEach((item, i) => {
        if (item === val) {
          time = Array.from(endTime.values())[i];
          return;
        }
      });
      if (time && Date.now() > time) {
        message.error('验证码已过期');
        return true;
      }
      return false;
    },
    associate(key: string, val: string): boolean {
      // 验证码与实际绑定的手机号不一致
      if (!map.has(key)) {
        message.error('当前手机号未发送任何验证码');
        return false;
      }
      const { code } = map.get(key)!;
      if (!code.has(val)) {
        message.error('验证码不存在');
        return false;
      }
      return true;
    },
    clear() {
      map.clear();
    },
    createMap() {
      map === undefined && (map = new Map());
    },
  };
}
