/**
 * Perform an async `Array.prototype.map()` operation
 */
export function asyncMap<T, P>(
  arr: T[],
  fn: (arg0: T, i: number, arr: T[]) => Promise<P>
): Promise<P[]> {
  return Promise.all(arr.map(fn))
}

/**
 * Perform an asycn `Array.prototype.some()` operation
 */
export async function asyncSome<T>(
  arr: T[],
  fn: (arg0: T, i: number, arr: T[]) => Promise<boolean>
): Promise<boolean> {
  const results = await asyncMap(arr, fn)
  return results.some((result) => result)
}
