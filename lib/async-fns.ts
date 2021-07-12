export function asyncMap(arr, fn): Promise<unknown[]> {
  return Promise.all(arr.map(fn))
}
