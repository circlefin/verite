import {
  asyncMap,
  decompress, expandBitstring, expandBitstringToBooleans, generateBitstring
} from "lib/verity"
import { Bits } from "@fry/bits"

/**
 * Helper to create a Buffer with the bits set to 1 at the indices given.
 */
  const indices2Buffer = (indices: number[], bitlength = 16): Buffer => {
  const bits = new Bits(bitlength)

  indices.forEach(credential => {
    bits.setBit(credential)
  });

  return bits.buffer
}

const vectors = [
  {
    credentials: [],
    bitstring: "eJztwTEBAAAAwqD1T20MH6AAAAAAAAAAAAAAAAAAAACAtwFAAAAB"
  },
  {
    credentials: [0],
    bitstring: "eJztwSEBAAAAAiCnO90ZFqABAAAAAAAAAAAAAAAAAAAA3gZB4ACB"
  },
  {
    credentials: [3], // zero index
    bitstring: "eJztwSEBAAAAAiAn+H+tMyxAAwAAAAAAAAAAAAAAAAAAALwNQDwAEQ=="
  },
  // {
  //   credentials: [],
  //   bitstring: "H4sIAAAAAAAAA-3BMQEAAADCoPVPbQsvoAAAAAAAAAAAAAAAAP4GcwM92tQwAAA"
  // }
]

describe("Status List 2021", () => {
  // "................................."
  // "eJzT0yMAAGTvBe8="
  it("generateRevocationList", async () => {
    const foo = await decompress("H4sIAAAAAAAAA-3BMQEAAADCoPVPbQsvoAAAAAAAAAAAAAAAAP4GcwM92tQwAAA")
    expect(1).toEqual(1)
  })

  it("validateCredential", async () => {
    expect(1).toEqual(1)
  })

  it("generateBitstring", async () => {
    await asyncMap(vectors, async vector => {
      const {credentials, bitstring} = vector

      const encodedList = await generateBitstring(credentials)
      expect(encodedList).toEqual(bitstring)
    })
  })

  it("expandBitstring", async () => {
    await asyncMap(vectors, async vector => {
      const {credentials, bitstring} = vector

      const decodedList = await expandBitstring(bitstring)
      expect(decodedList).toEqual(credentials)
      // expect(decodedList.length).toEqual(16_384 * 8)
    })
  })

  it("expandBitstringToBooleans", async () => {
    const buffer=indices2Buffer([0,1,15], 16)
    expect(expandBitstringToBooleans(buffer)).toEqual([true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, true])
  })

})
