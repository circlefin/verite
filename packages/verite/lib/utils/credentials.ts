import {
  createVerifiableCredentialJwt,
  createVerifiablePresentationJwt,
  verifyCredential,
  verifyPresentation
} from "did-jwt-vc"

import { VerificationError } from "../errors"
import { didResolver } from "./did-fns"

import type {
  CredentialPayload,
  JwtCredentialPayload,
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
import type {
  CreateCredentialOptions,
  CreatePresentationOptions,
  VerifyPresentationOptions
} from "did-jwt-vc/src/types"

/**
 * Encodes a Verifiable Credential as a JWT from passed payload object & issuer.
 */
export async function encodeVerifiableCredential(
  vcPayload: CredentialPayload | JwtCredentialPayload,
  signer: Issuer,
  options: CreateCredentialOptions = {}
): Promise<JWT> {
  const payload = Object.assign({
    vc: vcPayload
  })
  if (vcPayload.id) {
    payload.jti = vcPayload.id
  }
  if (vcPayload.issuanceDate) {
    payload.nbf = Math.round(Date.parse(vcPayload.issuanceDate) / 1000)
  }
  if (vcPayload.expirationDate) {
    payload.exp = Math.round(Date.parse(vcPayload.expirationDate) / 1000)
  }
  if (vcPayload.issuer) {
    payload.iss =
      typeof vcPayload.issuer === "string"
        ? vcPayload.issuer
        : vcPayload.issuer.id
  }
  if (vcPayload.credentialSubject && vcPayload.credentialSubject.id) {
    payload.sub = vcPayload.credentialSubject.id
  }

  return createVerifiableCredentialJwt(payload, signer, options)
}

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
    // eslint-disable-next-line no-prototype-builtins
    if (res.verifiableCredential.credentialSubject.hasOwnProperty(0)) {
      const newCs = Object.entries(res.verifiableCredential.credentialSubject).map(([key, value]) => {
        return value
       })
       const clone = JSON.parse(JSON.stringify(res.verifiableCredential))
       clone.credentialSubject = newCs
       return clone
    }
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
  options?: CreatePresentationOptions,
  type?: string[],
  extra: Record<string, unknown> = {}
): Promise<JWT> {
  const vcJwtPayload = Array.isArray(vcJwt) ? vcJwt : [vcJwt]
  const payload = Object.assign(
    {
      vp: {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        type: type ?? ["VerifiablePresentation"],
        verifiableCredential: vcJwtPayload,
        ...extra
      }
    }
  )
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
    if (res.verifiablePresentation.vp) {
      // did-jwt-vc leaves properties it doesn't recognize in vp; move them
      const vpFields = res.verifiablePresentation.vp
      res.verifiablePresentation = {
        ...res.verifiablePresentation,
        ...vpFields
      }
      const clone = JSON.parse(JSON.stringify(res.verifiablePresentation))
      delete clone.vp
      return clone
    }
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
