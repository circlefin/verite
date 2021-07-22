import {
  JwtCredentialPayload,
  JwtPresentationPayload,
  VerifiedCredential,
  VerifiedPresentation,
  verifyCredential,
  verifyPresentation
} from "did-jwt-vc"
import { didKeyResolver } from "./didKey"
import { JWT, VerificationError } from "./types"

export function verifiablePresentationPayload(
  subject: string,
  vcJwt: JWT | JWT[] = []
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
  attestation: Record<string, unknown>
): JwtCredentialPayload {
  return {
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
}

export function kycAmlVerifiableCredentialPayload(
  subject: string,
  attestation: Record<string, unknown>
): JwtCredentialPayload {
  return verifiableCredentialPayload("KYCAMLAttestation", subject, attestation)
}

export function creditScoreVerifiableCredentialPayload(
  subject: string,
  attestation: Record<string, unknown>
): JwtCredentialPayload {
  return verifiableCredentialPayload(
    "CreditScoreAttestation",
    subject,
    attestation
  )
}

/**
 * Decodes a JWT with a Verifiable Credential payload.
 */
export async function decodeVerifiableCredential(
  vc: JWT
): Promise<VerifiedCredential> {
  try {
    const verified = await verifyCredential(vc, didKeyResolver)
    return verified
  } catch (err) {
    throw new VerificationError(
      "Input wasn't a valid Verifiable Credential" // TODO
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
    const verified = await verifyPresentation(vpJwt, didKeyResolver)
    return verified
  } catch (err) {
    throw new VerificationError(
      "Input wasn't a valid Verifiable Presentation" // TODO
    )
  }
}
