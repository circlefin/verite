import {
  asyncMap,
  decompress, expandBitstring, expandBitstringToBooleans, expandBitstringToBooleans2, generateBitstring
} from "lib/verity"

const vectors = [
  {
    credentials: [],
    bitstring: "eJztwTEBAAAAwqD1T20MH6AAAAAAAAAAAAAAAAAAAACAtwFAAAAB"
  },
  {
    credentials: [3], // zero index
    bitstring: "eJztwSEBAAAAAiAn+H+tMyxAAwAAAAAAAAAAAAAAAAAAALwNQDwAEQ=="
  },
  {
    credentials: [],
    bitstring: "H4sIAAAAAAAAA-3BMQEAAADCoPVPbQsvoAAAAAAAAAAAAAAAAP4GcwM92tQwAAA"
  }
]

describe("Status List 2021", () => {
  // "................................."
  // "eJzT0yMAAGTvBe8="
  it("generateRevocationList", async () => {
    const foo = await decompress("H4sIAAAAAAAAA-3BMQEAAADCoPVPbQsvoAAAAAAAAAAAAAAAAP4GcwM92tQwAAA")
    console.log(foo)
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
      // expect(decodedList).toEqual(credentials)
      expect(decodedList.byteLength).toEqual(16_384)
    })
  })

  it("works?", () => {
    const buffer = new ArrayBuffer(1)
    const view = new Uint8Array(buffer)
    view[0] = 4

    expect(expandBitstringToBooleans(view)).toEqual([false, false, true, false, false, true, false, false])
  })


  it("works2?", async () => {
    const buffer = await decompress("eJztwTEBAAAAwqD1T20MH6AAAAAAAAAAAAAAAAAAAACAtwFAAAAB")

    // expect(expandBitstringToBooleans2(buffer)).toEqual(Array)
    const result = expandBitstringToBooleans2(buffer)
    expect(result.length).toEqual(16_384 * 8)
    for (let i = 0; i<16_384 * 8; i++) {
      expect(result[i]).toBe(false)
    }
  })


  it("works3?", async () => {
    const buffer = await decompress("eJztwSEBAAAAAiAn+H+tMyxAAwAAAAAAAAAAAAAAAAAAALwNQDwAEQ==")

    // expect(expandBitstringToBooleans2(buffer)).toEqual(Array)
    const result = expandBitstringToBooleans2(buffer)
    expect(result.length).toEqual(16_384 * 8)
    for (let i = 0; i<16_384 * 8; i++) {
      if (i !== 3) {
        expect(result[i]).toBe(false)
      }
    }
    expect(result.length).toBe(16_384*8)
    expect(result[3]).toBe(true)
  })

  it("works4?", async () => {
    const buffer = await decompress("eJztwSEBAAAAAiAn+H+tMyxAAwAAAAAAAAAAAAAAAAAAALwNQDwAEQ==")

    // expect(expandBitstringToBooleans2(buffer)).toEqual(Array)
    const result = expandBitstringToBooleans(buffer)
    expect(result.length).toEqual(16_384 * 8)
    // console.log(result[0])
    // console.log(result[1])
    // console.log(result[2])
    // console.log(result[3])
    // console.log(result[4])
    // console.log(result[5])
    // console.log(result[6])
    // console.log(result[7])
    // console.log(result[8])
    // console.log(result[9])
    for (let i = 0; i<16_384 * 8; i++) {
      if (i !== 3) {
        expect(result[i]).toBe(false)
      }
    }
    expect(result.length).toBe(16_384*8)
    expect(result[3]).toBe(true)
  })
})
