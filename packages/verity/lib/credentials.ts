import {
  JwtCredentialPayload,
  JwtPresentationPayload,
  VerifiableCredential,
  VerifiedCredential,
  VerifiedPresentation,
  verifyCredential,
  verifyPresentation
} from "did-jwt-vc"
import { JWT, RevocationList2021Status, VerificationError } from "../types"
import { didKeyResolver } from "./didKey"

export function verifiablePresentationPayload(
  subject: string,
  vcJwt: VerifiableCredential | VerifiableCredential[] = []
): JwtPresentationPayload {
  return {
    sub: subject,
    vp: {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiablePresentation"],
      holder: subject,
      verifiableCredential: [vcJwt].flat()
    }
  }
}

export function verifiableCredentialPayload(
  type: string,
  subject: string,
  attestation: Record<string, unknown>,
  credentialStatus?: RevocationList2021Status
): JwtCredentialPayload {
  const payload = {
    sub: subject,
    vc: {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://verity.id/identity"
      ],
      type: ["VerifiableCredential", type],
      credentialSubject: {
        [type]: attestation,
        id: subject
      }
    }
  }

  if (credentialStatus) {
    Object.assign(payload, { credentialStatus: credentialStatus })
  }

  return payload
}

export function kycAmlVerifiableCredentialPayload(
  subject: string,
  attestation: Record<string, unknown>,
  credentialStatus: RevocationList2021Status
): JwtCredentialPayload {
  return verifiableCredentialPayload(
    "KYCAMLAttestation",
    subject,
    attestation,
    credentialStatus
  )
}

export function creditScoreVerifiableCredentialPayload(
  subject: string,
  attestation: Record<string, unknown>,
  credentialStatus: RevocationList2021Status
): JwtCredentialPayload {
  return verifiableCredentialPayload(
    "CreditScoreAttestation",
    subject,
    attestation,
    credentialStatus
  )
}

/**
 * Decodes a JWT with a Verifiable Credential payload.
 */
export async function decodeVerifiableCredential(
  vc: JWT
): Promise<VerifiedCredential> {
  try {
    const res = await verifyCredential(vc, didKeyResolver)
    return res
  } catch (err) {
    throw new VerificationError(
      "Input wasn't a valid Verifiable Credential",
      err
    )
  }
}

/**
 * Decode a JWT with a Verifiable Presentation payload.
 */
export async function decodeVerifiablePresentation(
  vpJwt: JWT
): Promise<VerifiedPresentation> {
  try {
    const res = await verifyPresentation(vpJwt, didKeyResolver)
    return res
  } catch (err) {
    throw new VerificationError(
      "Input wasn't a valid Verifiable Presentation",
      err
    )
  }
}
