import { useCallback, useEffect, useRef, useState } from 'react';
import { useSleep as sleep } from './useSleep';

const interval = 1000;
const timeout = interval * 60 * 2;

export function usePolling(callback: () => any, delay = timeout): () => void {
  const callbackRef = useRef<Function>(callback);
  const clearTimer = useRef<Function>(() => {});
  const timerRef = useRef<NodeJS.Timer | undefined>();

  const [ready, setReady] = useState(false);

  useEffect(() => {
    callbackRef.current = callback;
    clearTimer.current = () => {
      setReady(false);
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    };
    return () => {
      clearTimer.current();
    };
  }, []);

  useEffect(() => {
    if (ready) {
      sleep(delay).then(() => {
        clearTimer.current();
      });
    }
  }, [ready]);

  const controller = useCallback(() => {
    if (!timerRef.current) {
      setReady(true);
      timerRef.current = setInterval(() => {
        callbackRef.current();
      }, interval);
    }
  }, []);

  return controller;
}
