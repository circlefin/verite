import { randomBytes } from "crypto"

import { buildAndSignVerifiableCredential } from "../../lib/issuer/credential-fulfillment"
import {
  buildIssuer,
  decodeVerifiableCredential,
  randomDidKey
} from "../../lib/utils"
import {
  attestationToCredentialType
} from "../../lib/utils/attestation-registry"
import { creditScoreAttestationFixture } from "../fixtures/attestations"

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
    attestationToCredentialType(creditScoreAttestationFixture.type)
  )

  return decodeVerifiableCredential(jwt)
}


