/**
 * Methods to deal with bitstrings
 */

import { Bits } from "@fry/bits"
import base64js from "base64-js"
import { inflate, deflate } from "pako"

// TODO: is this minimum or maximum?
export const MINIMUM_BITSTREAM_LENGTH = 16 * 1_024 * 8 // 16KB

/**
 * Apply zlib compression with Base64 encoding to a given string or buffer
 *
 * @returns a base64 encoded string containing the zlib compressed input
 */
export const compress = (input: string | Buffer): string => {
  const deflated = deflate(input)
  return base64js.fromByteArray(deflated)
}

/**
 * Given the base64 encoded input array, decode and unzip it to a Buffer
 *
 * @returns a Buffer containing the decoded base64 encoded string
 */
export const decompress = (input: string): Buffer => {
  const decoded = base64js.toByteArray(input)
  return Buffer.from(inflate(decoded))
}

/**
 * Generates a compressed bitstring from an array of index values
 *
 * @returns a string of bits representing the input array
 */
export const generateBitstring = (indicies: number[]): string => {
  const bits = new Bits(16_384 * 8) // 16KB
  indicies.forEach((index) => bits.setBit(index))
  return compress(bits.buffer)
}

/**
 * Generates an array of indices from a given bitstring
 *
 * @returns an array of indices from the bitstring
 */
export const expandBitstring = async (string: string): Promise<number[]> => {
  const buffer = await decompress(string)
  const bools = expandBitstringToBooleans(buffer)
  const result: number[] = []
  bools.forEach((b, index) => {
    if (b) {
      result.push(index)
    }
  })
  return result
}

/**
 * Map the bitstring to a list of booleans.
 *
 * @returns an array of booleans
 */
export const expandBitstringToBooleans = (bitstring: Buffer): boolean[] => {
  const bits = new Bits(bitstring)
  const results: boolean[] = []
  for (let i = 0; i < bitstring.byteLength * 8; i++) {
    results[i] = bits.testBit(i)
  }
  return results
}
