import { UserInfo } from '@/services/typing';
import { uniqBy } from 'lodash';
import { useCallback, useMemo, useRef } from 'react';

export type LocalUsersType = {
  auto: boolean;
  remember: boolean;
} & UserInfo;

/**
 * 从本地缓存中存取登录过的历史用户列表
 */
export function useLocalUsers() {
  const localData = useRef<LocalUsersType[]>(
    JSON.parse(localStorage.getItem('userList') || '[]')
  );

  const get = useCallback(
    (uid: string) => localData.current.filter(item => item.uid === uid)[0],
    [localData]
  );

  const set = useCallback(
    (data: LocalUsersType) => {
      localData.current.push(data);
      localStorage.setItem(
        'userList',
        JSON.stringify(uniqBy(localData.current, 'uid'))
      );
    },
    [localData]
  );

  const clear = useCallback(() => {
    localData.current.length = 0;
    localStorage.removeItem('users');
  }, [localData]);

  const list = useCallback(() => localData.current, [localData]);

  return useMemo(
    () => ({
      get,
      set,
      clear,
      list,
    }),
    [get, set, clear, list]
  );
}
