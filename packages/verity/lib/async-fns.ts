export function asyncMap<T, P>(
  arr: T[],
  fn: (arg0: T, i: number, arr: T[]) => Promise<P>
): Promise<P[]> {
  return Promise.all(arr.map(fn))
}
