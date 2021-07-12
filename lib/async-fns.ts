export function asyncMap<T>(
  arr: T[],
  fn: (T, i?: number) => unknown
): Promise<unknown[]> {
  return Promise.all(arr.map(fn))
}
