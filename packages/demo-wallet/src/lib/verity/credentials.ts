import { EdDSASigner } from "did-jwt"
import {
  createVerifiableCredentialJwt,
  createVerifiablePresentationJwt,
  CredentialPayload,
  Issuer,
  JwtCredentialPayload,
  JwtPresentationPayload,
  PresentationPayload,
  VerifiedCredential,
  VerifiedPresentation,
  verifyCredential,
  verifyPresentation
} from "did-jwt-vc"
import { didKeyResolver } from "./didKey"
import { JWT, VerificationError, Verified } from "./types"

const did = process.env.ISSUER_DID
const secret = process.env.ISSUER_SECRET

export const issuer: Issuer = {
  did: did,
  alg: "EdDSA"
  //signer: EdDSASigner(secret)
}

export function verifiablePresentationPayload(
  subject: Issuer,
  vcJwt: JWT | JWT[] = []
): JwtPresentationPayload {
  return {
    sub: subject.did,
    vp: {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiablePresentation"],
      holder: subject.did,
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

/**
 * Sign a VC and return a JWT
 */
export const signVerifiableCredential = async (
  vcPayload: JwtCredentialPayload | CredentialPayload
): Promise<JWT> => {
  return createVerifiableCredentialJwt(vcPayload, issuer)
}

/**
 * Sign a VP and return a JWT
 */
export const signVerifiablePresentation = async (
  vcPayload: JwtPresentationPayload | PresentationPayload
): Promise<JWT> => {
  return createVerifiablePresentationJwt(vcPayload, issuer)
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
