import { CallbackWithArgs } from '@/utils/type';
import { isBoolean } from 'lodash-es';
import { DependencyList, useMemo, useRef } from 'react';

type Callback = CallbackWithArgs | Promise<CallbackWithArgs>;

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
export function useCallbackPlus<T>(callback: Callback, deps: DependencyList) {
  const beforeFnRef = useRef<CallbackWithArgs>();
  const afterFnRef = useRef<CallbackWithArgs>();
  const callbackMemo = useMemo<Callback>(() => callback, deps);

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
      const isStop = beforeFnRef.current?.(...args);
      if (isBoolean(isStop) && !isStop) return;
      let fnRes: boolean | any;
      const fn = (callbackMemo as Function).bind(undefined, ...args);
      // 处理回调为异步函数
      if (isAsyncFunction(fn)) {
        const asyncFn = async () => {
          fnRes = await fn();
          afterFnRef.current?.(fnRes);
        };
        asyncFn();
      } else {
        fnRes = fn();
        if (isBoolean(fnRes) && !fnRes) return;
        afterFnRef.current?.(fnRes);
      }
    },
  };
}

function isAsyncFunction(fn: any) {
  return fn[Symbol.toStringTag] === 'AsyncFunction';
}
