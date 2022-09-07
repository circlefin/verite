export function getValueOrLastArrayEntry(theArray: string[]): string {
  const value = Array.isArray(theArray)
    ? theArray[theArray.length - 1]
    : theArray
  return value
}
