import { randomBytes } from "crypto"
import { generateDidKey } from "../../lib/utils/did-fns"
import { DidKey } from "../../types"

/**
 * Returns a did:key with a random seed.
 *
 * @remarks This method should be used for testing purposes only.
 *
 * @returns a did:key with a random seed
 */
export function randomDidKey(): DidKey {
  const secureRandom = () => new Uint8Array(randomBytes(32))
  return generateDidKey({ secureRandom })
}
