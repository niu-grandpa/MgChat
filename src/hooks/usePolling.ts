import { useEffect, useRef } from 'react';

export function usePolling(callback: () => boolean | void, ms = 1000) {
  const timer = useRef<NodeJS.Timer | null>(null);

  const callbackRef = useRef<() => boolean | void>(callback);

  const clearTimer = useRef<() => void>(() => {});

  useEffect(() => {
    callbackRef.current = callback;
    clearTimer.current = () => {
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
    };
  }, [callback]);

  useEffect(() => {
    timer.current = setInterval(() => {
      const stop = callbackRef.current();
      if (stop === true) clearTimer.current();
    }, ms);
    return () => {
      callbackRef.current();
    };
  }, [ms]);
}
