export type Callback<T> = () => T;
export type CallbackWithArgs<T = any> = (...args: T[]) => any;
