import { useSleep as sleep } from '@/hooks';
import { message } from 'antd';
import { ResponseData } from './typing';

type Result<T> = Promise<false | T>;

export function apiHandler<T extends unknown>(
  callback: () => ResponseData<T>
): Result<T> {
  let reload = false;
  const handler = async (): Result<T> => {
    try {
      const { code, msg, data } = await callback();
      if (code !== 0) {
        message.warning(msg);
        return false;
      }
      return data;
    } catch (error) {
      if (!reload) {
        await sleep(200);
        reload = true;
        return await handler();
      } else {
        message.error('接口调用发生错误');
        console.log('[apiHandler] error: ', error);
      }
      return false;
    } finally {
      reload = false;
    }
  };

  return handler();
}
