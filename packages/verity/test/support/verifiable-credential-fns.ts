import { creditScoreAttestation } from "../../lib/attestation"
import { buildAndSignVerifiableCredential } from "../../lib/issuer/fulfillment"
import { decodeVerifiableCredential } from "../../lib/utils"
import type { Verifiable, W3CCredential } from "../../types/W3C"
import { randomIssuer } from "./issuer-fns"

export async function generateVerifiableCredential(): Promise<
  Verifiable<W3CCredential>
> {
  const signer = await randomIssuer()
  const jwt = await buildAndSignVerifiableCredential(
    signer,
    signer.did,
    creditScoreAttestation(100)
  )

  return decodeVerifiableCredential(jwt)
}
