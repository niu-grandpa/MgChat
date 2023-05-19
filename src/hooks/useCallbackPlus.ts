import { CallbackWithArgs } from '@/utils/type';
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
  const beforeFnRef = useRef<Callback>();
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
      const beforeFn = (beforeFnRef.current as Function)?.bind(
        undefined,
        ...args
      );

      const isFalse = (val: any) => val === false;

      const mainTask = () => {
        let fnRes: boolean | any;
        const mainFn = (callbackMemo as Function).bind(undefined, ...args);
        // 处理回调为异步函数
        if (isAsyncFunction(mainFn)) {
          const asyncFn = async () => {
            fnRes = await mainFn();
            !isFalse(fnRes) && afterFnRef.current?.(fnRes);
          };
          asyncFn();
        } else {
          fnRes = mainFn();
          !isFalse(fnRes) && afterFnRef.current?.(fnRes);
        }
      };

      if (beforeFn) {
        if (isAsyncFunction(beforeFn)) {
          const callBeforeFn = async () => {
            !isFalse(await beforeFn()) && mainTask();
          };
          callBeforeFn();
        } else if (!isFalse(beforeFn())) {
          mainTask();
        }
      } else {
        mainTask();
      }
    },
  };
}

function isAsyncFunction(fn: any) {
  return fn[Symbol.toStringTag] === 'AsyncFunction';
}
