import {
  createVerifiableCredentialJwt,
  createVerifiablePresentationJwt,
  verifyCredential,
  verifyPresentation
} from "did-jwt-vc"
import { isString } from "lodash"

import { VerificationError } from "../errors"
import { VC_CONTEXT_URI, VERIFIABLE_PRESENTATION_TYPE_NAME } from "./constants"
import { didResolver } from "./did-fns"

import type {
  CredentialPayload,
  JwtCredentialPayload,
  Issuer,
  JWT,
  VerifiableCredential,
  RevocableCredential,
  StatusList2021Credential,
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


export function asJwtCredentialPayload (credentialPayload: CredentialPayload) : JwtCredentialPayload {
  const payload = Object.assign({
    vc: credentialPayload
  })
  if (credentialPayload.id) {
    payload.jti = credentialPayload.id
  }
  if (credentialPayload.issuanceDate) {

    payload.nbf = Math.round(Date.parse(credentialPayload.issuanceDate.toString()) / 1000)
  }
  if (credentialPayload.expirationDate) {
    payload.exp = Math.round(Date.parse(credentialPayload.expirationDate.toString()) / 1000)
  }
  if (credentialPayload.issuer) {
    payload.iss = isString(credentialPayload.issuer)
      ? credentialPayload.issuer
      : credentialPayload.issuer.id
  }
  if (credentialPayload.credentialSubject) {
    // assumes the same subject for all attestations
    const sub = Array.isArray(credentialPayload.credentialSubject)
      ? credentialPayload.credentialSubject[0].id
      : credentialPayload.credentialSubject.id
    payload.sub = sub
  }
  return payload

}

/**
 * Signs a Verifiable Credential as a JWT from passed payload object & issuer.
 */
export async function signVerifiableCredential(
  vcPayload: CredentialPayload | JwtCredentialPayload,
  issuer: Issuer,
  options: CreateCredentialOptions = {}
): Promise<JWT> {
  let payload = vcPayload
  if (!vcPayload.hasOwnProperty('vc')) {
    payload = asJwtCredentialPayload(vcPayload as CredentialPayload)
  }
  
  return createVerifiableCredentialJwt(payload, issuer, options)
}

/**
 * Decodes a JWT with a Verifiable Credential payload.
 */
export async function verifyVerifiableCredential(
  vcJwt: JWT
): Promise<
  Verifiable<W3CCredential> | RevocableCredential | StatusList2021Credential
> {
  try {
    const res = await verifyCredential(vcJwt, didResolver)
    // eslint-disable-next-line no-prototype-builtins
    if (res.verifiableCredential.credentialSubject.hasOwnProperty(0)) {
      // did-jwt-vc turns these arrays into maps; convert back
      const newCs = Object.entries(
        res.verifiableCredential.credentialSubject
      ).map(([_, value]) => {
        // need this addtional cleanup for did-jwt-vc adding string-y payload
        // args to the decoded representation
        if (!isString(value)) {
          return value
        }
      })
      const clone = JSON.parse(JSON.stringify(res.verifiableCredential))
      clone.credentialSubject = newCs
      if (clone.vc) {
        // delete vc property if it wasn't cleaned up by did-jwt-vc
        delete clone.vc
      }

      return clone
    } else {
      const clone = JSON.parse(JSON.stringify(res.verifiableCredential))
      if (clone.vc) {
        // delete vc property if it wasn't cleaned up by did-jwt-vc
        delete clone.vc
      }
      return clone
    }
  } catch (err) {
    throw new VerificationError(
      "Input wasn't a valid Verifiable Credential",
      err as Error
    )
  }
}

/**
 * Signs a JWT with the Verifiable Presentation payload.
 */
export async function signVerifiablePresentation(
  subject: string,
  vcJwt: VerifiableCredential | VerifiableCredential[] = [],
  issuer: Issuer,
  options?: CreatePresentationOptions,
  type?: string[],
  extra: Record<string, unknown> = {}
): Promise<JWT> {
  const vcJwtPayload = Array.isArray(vcJwt) ? vcJwt : [vcJwt]
  const payload = Object.assign({
    vp: {
      "@context": [VC_CONTEXT_URI],
      type: type ?? [VERIFIABLE_PRESENTATION_TYPE_NAME],
      verifiableCredential: vcJwtPayload,
      ...extra
    }
  })
  return createVerifiablePresentationJwt(payload, issuer, options)
}

/**
 * Verify a JWT with a Verifiable Presentation payload.
 */
export async function verifyVerifiablePresentation(
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
