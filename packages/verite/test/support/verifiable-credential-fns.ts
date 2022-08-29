import { randomBytes } from "crypto"

import { buildAndSignVerifiableCredential } from "../../lib/issuer/credential-fulfillment"
import {
  attestationToCredentialType,
  buildIssuer,
  decodeVerifiableCredential,
  randomDidKey
} from "../../lib/utils"
import { creditScoreAttestationFixture } from "../fixtures/attestations"
import { creditScoreSchema } from "../fixtures/schemas"

import type { Verifiable, W3CCredential } from "../../types/DidJwt"

export async function generateVerifiableCredential(): Promise<
  Verifiable<W3CCredential>
> {
  const didKey = randomDidKey(randomBytes)
  const signer = buildIssuer(didKey.subject, didKey.privateKey)
  const jwt = await buildAndSignVerifiableCredential(
    signer,
    signer.did,
    creditScoreAttestationFixture,
    attestationToCredentialType(creditScoreAttestationFixture.type),
    creditScoreSchema
  )

  return decodeVerifiableCredential(jwt)
}


