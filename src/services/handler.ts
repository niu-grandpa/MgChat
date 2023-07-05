import { useSleep as sleep } from '@/hooks';
import { message } from 'antd';
import { ResponseData } from './typing';

type Result<T> = Promise<false | T>;

/**
 * 当接口调用出错时处理其他边界条件
 * @param callback api函数
 * @returns
 */
export function apiHandler<T extends unknown>(
  callback: () => ResponseData<T>,
  error?: () => void,
  complete?: () => void
): Result<T> {
  let reconnection = false;

  const handler = async (): Result<T> => {
    try {
      const { code, msg, data } = await callback();
      if (code !== 0) {
        code !== 4 && message.warning(msg);
        error?.();
        return false;
      }
      return data;
    } catch (error: any) {
      // 接口调用出错，8秒内间隔1s重发一次请求
      if (reconnection) {
        let res: T | false = false;
        const timer = setInterval(() => {
          handler().then(data => (res = data));
        }, 1000);
        // 重新调用接口成功则清除定时器，保持允许重连状态
        if (res !== false) {
          clearInterval(timer);
          return res;
        }
        await sleep(15000);
        reconnection = false;
        clearInterval(timer);
        return false;
      } else {
        message.error('服务器错误');
        console.error('[apiHandler] error: ', error.response.data);
        return false;
      }
    } finally {
      complete?.();
      reconnection = false;
    }
  };

  return handler();
}
