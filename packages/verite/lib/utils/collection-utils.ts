
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const IsEmpty = (arr: any[] | undefined): boolean => {
  return !Array.isArray(arr) || !arr.length
}
