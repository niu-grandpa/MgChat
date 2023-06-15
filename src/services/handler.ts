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
    } catch (error: any) {
      // 2秒后重新发起请求
      if (!reload) {
        await sleep(2000);
        reload = true;
        return await handler();
      } else {
        message.error('请求失败');
        console.error('[apiHandler] error: ', error.response.data);
        return false;
      }
    } finally {
      reload = false;
    }
  };

  return handler();
}
