import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

/** 获取哈希表缓存窗口对应的key */
export function useGetWinKey() {
  const { pathname, search } = useLocation();
  return useMemo(
    () => `${pathname}${search}`.replace('/', ''),
    [pathname, search]
  );
}
