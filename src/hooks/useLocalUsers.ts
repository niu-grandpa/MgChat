import { uniqBy } from 'lodash';
import { useCallback, useMemo } from 'react';

export type LocalUsersType = {
  uid: string;
  icon: string;
  nickname: string;
  password: string;
  auto: boolean;
  remember: boolean;
};

/**
 * 从本地缓存中存取登录过的历史用户列表
 */
export function useLocalUsers() {
  const localData = useMemo<LocalUsersType[]>(() => {
    const data = localStorage.getItem('users');
    return data ? JSON.parse(data) : [];
  }, []);

  const list = useMemo(() => localData, [localData]);

  const get = useCallback(
    (uid: string) => localData.filter(item => item.uid === uid)[0],
    [localData]
  );

  const set = useCallback((data: LocalUsersType) => {
    localData.push(data);
    localStorage.setItem('users', JSON.stringify(uniqBy(localData, 'uid')));
  }, []);

  const clear = useCallback(() => {
    localData.length = 0;
    localStorage.removeItem('users');
  }, []);

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
