import { createVerifiableCredentialJwt } from "did-jwt-vc"
import { creditScoreAttestation } from "../../lib/attestation"
import { buildVerifiableCredentialPayload } from "../../lib/issuer/fulfillment"
import { decodeVerifiableCredential } from "../../lib/utils"
import type { Verifiable, W3CCredential } from "../../types/W3C"
import { randomIssuer } from "./issuer-fns"

export async function generateVerifiableCredential(): Promise<
  Verifiable<W3CCredential>
> {
  const signer = await randomIssuer()
  const vcPayload = buildVerifiableCredentialPayload(
    { id: signer.did },
    signer.did,
    creditScoreAttestation(100)
  )

  const jwt = await createVerifiableCredentialJwt(vcPayload, signer)

  return decodeVerifiableCredential(jwt)
}
