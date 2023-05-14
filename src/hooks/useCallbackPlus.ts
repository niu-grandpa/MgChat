import { CallbackWithArgs } from '@/utils/type';
import { isBoolean } from 'lodash-es';
import { DependencyList, useMemo, useRef } from 'react';

type UseCallbackPlus<T> = {
  before(handler: CallbackWithArgs): boolean | UseCallbackPlus<T>;
  after(handler: CallbackWithArgs<T>): void;
  invoke(...args: any[]): void;
};

/**
 * 加强版useCallback，能够在本体函数执行前或执行后调用给定的回调，
 * 为业务函数的职责分离提供了条件。
 *@example
 * ```ts
 * const cb = useCallbackPlus(() => {
 *  // ....
 * }, []).before(() => {...}).after(() => {...});
 * ```
 */
export function useCallbackPlus<T>(
  callback: CallbackWithArgs<T>,
  deps: DependencyList
): UseCallbackPlus<T> {
  const beforeFnRef = useRef<CallbackWithArgs>();
  const afterFnRef = useRef<CallbackWithArgs>();
  const callbackMemo = useMemo<CallbackWithArgs<T>>(() => callback, deps);

  return {
    before(handler: CallbackWithArgs) {
      beforeFnRef.current = handler;
      return this;
    },
    after(handler: CallbackWithArgs<T>) {
      afterFnRef.current = handler;
      return this;
    },
    invoke(...args: any[]) {
      const isStop = beforeFnRef.current?.();
      if (isBoolean(isStop) && !isStop) return;
      const returnVal = callbackMemo(...args);
      afterFnRef.current?.(returnVal);
    },
  };
}
