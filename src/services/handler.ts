import { useSleep as sleep } from '@/hooks';
import { message } from 'antd';
import { ResponseData } from './typing';

type Result<T> = Promise<false | T>;

/**
 * 处理当接口调用时出错
 * @param callback api函数
 * @returns
 */
export function apiHandler<T extends unknown>(
  callback: () => ResponseData<T>
): Result<T> {
  let reconnection = false;

  const handler = async (): Result<T> => {
    try {
      const { code, msg, data } = await callback();
      if (code !== 0) {
        message.warning(msg);
        return false;
      }
      return data;
    } catch (error: any) {
      // 接口调用出错，5秒内间隔500ms重发一次请求
      if (reconnection) {
        let res: T | false = false;
        const timer = setInterval(() => {
          handler().then(data => (res = data));
        }, 500);
        // 重新调用接口成功则清除定时器，保持允许重连状态
        if (res !== false) {
          clearInterval(timer);
          return res;
        }
        await sleep(5000);
        reconnection = false;
        clearInterval(timer);
        return false;
      } else {
        message.error('请求失败');
        console.error('[apiHandler] error: ', error.response.data);
        return false;
      }
    } finally {
      reconnection = false;
    }
  };

  return handler();
}
