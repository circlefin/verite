import { generateDidKey } from "../../lib/utils"
import { DidKey } from "../../types"

/**
 * Helper function to generate a did:key DID with a consistent keypair. This
 * is helpful when testing so that expected values can be hard-coded.
 */
export const didFixture = (value = 0): DidKey => {
  const seed = () => {
    const arr = Array(32).fill(value, 0, 31)
    return Uint8Array.from(arr)
  }

  return generateDidKey({ secureRandom: seed })
}
