/**
 * Methods to deal with bitstrings
 */

import { BitBuffer } from "bit-buffers"

export const MINIMUM_BITSTREAM_LENGTH = 16 * 1_024 * 8 // 16KB

/**
 * Generates a compressed bitstring from an array of index values
 *
 * @returns a string of bits representing the input array
 */
export const generateBitstring = (indexArray: number[]): string => {
  return BitBuffer.fromIndexArray(indexArray).toBitstring()
}
