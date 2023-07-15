import { useRef } from 'react';

export function useSleep(sleep: number) {
  let timer = useRef<NodeJS.Timeout | undefined>(undefined);
  return new Promise(resolve => {
    timer.current = setTimeout(() => {
      resolve(true);
      timer.current = undefined;
    }, sleep);
  });
}
