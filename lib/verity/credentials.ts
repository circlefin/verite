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
import { JWT, VerificationError, VerifiedResult } from "./types"

const did = process.env.ISSUER_DID
const secret = process.env.ISSUER_SECRET

export const issuer: Issuer = {
  did: did,
  alg: "EdDSA",
  signer: EdDSASigner(secret)
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

export function kycAmlVerifiableCredentialPayload(
  subject: string,
  kycAttestation: Record<string, unknown>
): JwtCredentialPayload {
  return {
    sub: subject,
    vc: {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://centre.io/identity"
      ],
      type: ["VerifiableCredential", "KYCAMLAttestation"],
      credentialSubject: {
        KYCAMLAttestation: kycAttestation,
        id: subject
      }
    }
  }
}

/**
 * Decodes a JWT with a Verifiable Credential payload.
 */
export async function decodeVerifiableCredential(
  vc: JWT
): Promise<VerifiedResult<VerifiedCredential>> {
  try {
    const res = await verifyCredential(vc, didKeyResolver)
    res.results = getChecks()
    return res
  } catch (err) {
    // coarse mapping
    const result = toErrorObject(err)
    throw new VerificationError("Failed to verify", [result], err)
  }
}

/**
 * Decode a JWT with a Verifiable Presentation payload.
 */
export async function decodeVerifiablePresentation(
  vpJwt: JWT
): Promise<VerifiedResult<VerifiedPresentation>> {
  try {
    const res = await verifyPresentation(vpJwt, didKeyResolver)
    res.results = getChecks()
    return res
  } catch (err) {
    // coarse mapping
    const result = toErrorObject(err)
    throw new VerificationError("Failed to verify", [result], err)
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
function toErrorObject(err: any) {
  return {
    status: 400,
    title: err.name,
    detail: err.message
  }
}

function getChecks() {
  return [
    {
      status: 200,
      title: "VC Format",
      detail: "Validated Verifiable Credential format"
    }
  ]
}
