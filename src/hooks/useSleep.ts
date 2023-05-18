export function useSleep(sleep: number) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true);
    }, sleep);
  });
}
