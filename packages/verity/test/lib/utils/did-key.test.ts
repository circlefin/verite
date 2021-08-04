import { didKeyToIssuer, generateDidKey } from "../../../lib/utils/did-fns"
import { randomDidKey } from "../../support/did-fns"

describe("generateDidKey()", () => {
  it("generates a DiKey from the given input", async () => {
    const bytes = Buffer.from(
      "2ac8ddd5cca1ce6030fe41576b70a4f2f000441f272aa6a623292806a103ce42",
      "hex"
    )

    const didKey = await generateDidKey({ secureRandom: () => bytes })

    expect(didKey.publicKey).toBeDefined()
    expect(didKey.privateKey).toBeDefined()
    expect(didKey.controller.startsWith("did:key")).toBe(true)
    expect(didKey.id.startsWith(didKey.controller)).toBe(true)
  })
})

describe("didKeyToIssuer()", () => {
  it("converts a DidKey to an Issuer", async () => {
    const didKey = await randomDidKey()
    const issuer = await didKeyToIssuer(didKey)
    expect(issuer.did).toBe(didKey.controller)
  })
})
