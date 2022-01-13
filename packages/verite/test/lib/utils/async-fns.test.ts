import { asyncMap, asyncSome } from "../../../lib/utils"

describe("asyncMap()", () => {
  it("performs a `Array.prototype.map()` call while awaiting all async operations", async () => {
    const arr = [1, 2, 3]

    const result = await asyncMap(arr, async (item) => {
      return Promise.resolve(item * 2)
    })

    expect(result).toEqual([2, 4, 6])
  })
})

describe("asyncSome()", () => {
  it("returns true if any of the async operations resolve to true", async () => {
    const arr = [1, 2, 3]

    const result = await asyncSome(arr, async (item) => {
      return Promise.resolve(item === 2)
    })

    expect(result).toBe(true)
  })

  it("returns false if none of the async operations resolve to true", async () => {
    const arr = [1, 2, 3]

    const result = await asyncSome(arr, async (item) => {
      return Promise.resolve(item === 20)
    })

    expect(result).toBe(false)
  })
})
