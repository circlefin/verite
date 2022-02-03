/**
 * Perform an async `Array.prototype.map()` operation
 *
 * @returns an array of the results of the async operation
 */
export function asyncMap<T, P>(
  arr: T[],
  fn: (arg0: T, i: number, arr: T[]) => Promise<P>
): Promise<P[]> {
  return Promise.all(arr.map(fn))
}

/**
 * Perform an async `Array.prototype.some()` operation
 *
 * @returns true if any of the items in the array pass the test, false otherwise
 */
export async function asyncSome<T>(
  arr: T[],
  fn: (arg0: T, i: number, arr: T[]) => Promise<boolean>
): Promise<boolean> {
  const results = await asyncMap(arr, fn)
  return results.some((result) => result)
}
