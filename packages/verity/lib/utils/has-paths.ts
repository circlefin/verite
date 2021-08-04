import { has } from "lodash"

/**
 * Determine if a given path exists in an object
 */
export function hasPaths(
  obj: Record<string, unknown>,
  keys: string[]
): boolean {
  return keys.every((key) => has(obj, key))
}
