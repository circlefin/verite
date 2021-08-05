import { didKeyToIssuer, randomDidKey } from "../../lib/utils/did-fns"
import { Issuer } from "../../types"

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
