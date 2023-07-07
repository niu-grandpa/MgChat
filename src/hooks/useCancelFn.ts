import { useCallback, useRef } from 'react';

export function useCancelFn(timeout: number) {
  const timer = useRef<NodeJS.Timeout>();

  const handleStart = useCallback(
    (fn: () => any) => {
      if (!timer.current) {
        timer.current = setTimeout(fn, timeout);
      }
    },
    [timer, timeout]
  );

  const handleCancel = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = undefined;
    }
  }, [timer]);

  return {
    start: handleStart,
    cancel: handleCancel,
  };
}
