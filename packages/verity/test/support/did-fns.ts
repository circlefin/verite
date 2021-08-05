import { randomBytes } from "crypto"
import { didKeyToIssuer, generateDidKey } from "../../lib/utils/did-fns"
import { DidKey, Issuer } from "../../types"

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

/**
 * Returns an Issuer with a random did:key
 *
 * @remarks This method should be used for testing purposes only.
 *
 * @returns an Issuer from a random did:key
 */
export async function randomIssuer(): Promise<Issuer> {
  const didKey = await randomDidKey()
  return didKeyToIssuer(didKey)
}
