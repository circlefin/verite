import {
  JwtCredentialPayload,
  JwtPresentationPayload,
  VerifiedCredential,
  VerifiedPresentation,
  verifyCredential,
  verifyPresentation
} from "did-jwt-vc"
import { JWT, CredentialStatus, VerificationError, Verified } from "../types"
import { didKeyResolver } from "./didKey"

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
  attestation: Record<string, unknown>,
  status?: CredentialStatus
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

  if (status) {
    Object.assign(payload, { credentialStatus: status })
  }

  return payload
}

export function kycAmlVerifiableCredentialPayload(
  subject: string,
  attestation: Record<string, unknown>,
  status: CredentialStatus
): JwtCredentialPayload {
  return verifiableCredentialPayload(
    "KYCAMLAttestation",
    subject,
    attestation,
    status
  )
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
): Promise<Verified<VerifiedCredential>> {
  try {
    const res = await verifyCredential(vc, didKeyResolver)
    res.checks = getChecks()
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
): Promise<Verified<VerifiedPresentation>> {
  try {
    const res = await verifyPresentation(vpJwt, didKeyResolver)
    res.checks = getChecks()
    return res
  } catch (err) {
    throw new VerificationError(
      "Input wasn't a valid Verifiable Presentation",
      err
    )
  }
}

// TODO: temporary hack
function getChecks() {
  return [
    {
      status: 200,
      title: "VC Format Check",
      detail: "Validated Verifiable Credential format"
    }
  ]
}
