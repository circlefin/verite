import crypto from "crypto"
import "react-native"
import { generate } from "../src/lib/DidKey"

it("generates a did:key with random bytes", () => {
  const secureRandom = () => new Uint8Array(crypto.randomBytes(32))
  generate({ secureRandom })
})

// Test Vectors
// https://github.com/w3c-ccg/did-method-key/blob/master/test-vectors/ed25519-x25519.json
it("generates a did:key with a seed", () => {
  const seed =
    "0000000000000000000000000000000000000000000000000000000000000000"
  const secureRandom = () => Buffer.from(seed, "hex")
  const did = generate({ secureRandom })
  expect(did.controller).toBe(
    "did:key:z6MkiTBz1ymuepAQ4HEHYSF1H8quG5GLVVQR3djdX3mDooWp"
  )
})
