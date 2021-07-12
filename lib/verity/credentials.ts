import {
  JwtCredentialPayload,
  verifyCredential,
  JwtPresentationPayload,
  Issuer
} from "did-jwt-vc"
import {
  JWT,
  VerifiedCredential,
  VerifiedPresentation
} from "did-jwt-vc/lib/types"

import { verifyPresentation } from "lib/sign-utils"
import { didKeyResolver } from "lib/verity"

export function vcPayloadApplication(subject: Issuer): JwtCredentialPayload {
  return {
    sub: subject.did,
    vc: {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      credentialSubject: {
        id: subject.did
      }
    }
  }
}

export function vpPayload(subject: Issuer, vcJwt?: JWT | JWT[]): JwtPresentationPayload {
  return {
    iss: subject.did,
    sub: subject.did,
    vp: {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiablePresentation"],
      holder:  subject.did,
      verifiableCredential: vcJwt ? [vcJwt].flat() : []
    }
  }
}

export function vcPayloadKYCFulfillment(
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
export function decodeVc(vc: JWT): Promise<VerifiedCredential> {
  return verifyCredential(vc, didKeyResolver)
}

/**
 * Decode a JWT with a Verifiable Presentation payload.
 */
 export async function decodeVp(vpJwt: JWT): Promise<VerifiedPresentation> {
  return verifyPresentation(vpJwt, didKeyResolver)
}
