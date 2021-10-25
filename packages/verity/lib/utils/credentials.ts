import {
  createVerifiablePresentationJwt,
  verifyCredential,
  verifyPresentation
} from "did-jwt-vc"
import type {
  CreatePresentationOptions,
  VerifyPresentationOptions
} from "did-jwt-vc/src/types"
import type {
  Issuer,
  JWT,
  VerifiableCredential,
  RevocableCredential,
  RevocationListCredential,
  Verifiable,
  W3CCredential,
  W3CPresentation,
  RevocablePresentation
} from "../../types"
import { VerificationError } from "../errors"
import { didResolver } from "./did-fns"

/**
 * Decodes a JWT with a Verifiable Credential payload.
 */
export async function decodeVerifiableCredential(
  vcJwt: JWT
): Promise<
  Verifiable<W3CCredential> | RevocableCredential | RevocationListCredential
> {
  try {
    const res = await verifyCredential(vcJwt, didResolver)
    return res.verifiableCredential
  } catch (err) {
    throw new VerificationError(
      "Input wasn't a valid Verifiable Credential",
      err as Error
    )
  }
}

/**
 * Encodes a JWT with the Verifiable Presentation payload.
 */
export async function encodeVerifiablePresentation(
  subject: string,
  vcJwt: VerifiableCredential | VerifiableCredential[] = [],
  signer: Issuer,
  options?: CreatePresentationOptions
): Promise<JWT> {
  const payload = {
    sub: subject,
    vp: {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiablePresentation"],
      holder: subject,
      verifiableCredential: [vcJwt].flat()
    }
  }
  return createVerifiablePresentationJwt(payload, signer, options)
}

/**
 * Decode a JWT with a Verifiable Presentation payload.
 */
export async function decodeVerifiablePresentation(
  vpJwt: JWT,
  options?: VerifyPresentationOptions
): Promise<Verifiable<W3CPresentation> | RevocablePresentation> {
  try {
    const res = await verifyPresentation(vpJwt, didResolver, options)
    return res.verifiablePresentation
  } catch (err) {
    throw new VerificationError(
      "Input wasn't a valid Verifiable Presentation",
      err as Error
    )
  }
}

/**
 * Determines if a given credential is expired
 */
export function isExpired(credential: Verifiable<W3CCredential>): boolean {
  if (!credential.expirationDate) {
    return false
  }

  const expirationDate = new Date(credential.expirationDate)
  return expirationDate < new Date()
}
