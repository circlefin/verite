import { BitBuffer } from "bit-buffers"
import {
  createVerifiableCredentialJwt,
  createVerifiablePresentationJwt,
  verifyCredential,
  verifyPresentation
} from "did-jwt-vc"
import { has, isString } from "lodash"

import { VerificationError } from "../errors"
import { didResolver } from "./did-fns"

import type {
  CredentialPayload,
  JwtCredentialPayload,
  Issuer,
  JWT,
  RevocableCredential,
  StatusList2021Credential,
  Verifiable,
  W3CCredential,
  W3CPresentation,
  RevocablePresentation,
  MaybeRevocableCredential
} from "../../types"
import type {
  CreateCredentialOptions,
  CreatePresentationOptions,
  JwtPresentationPayload,
  VerifyPresentationOptions
} from "did-jwt-vc/src/types"

export function asJwtCredentialPayload(
  credentialPayload: CredentialPayload
): JwtCredentialPayload {
  const payload = Object.assign({
    vc: credentialPayload
  })
  if (credentialPayload.id) {
    payload.jti = credentialPayload.id
  }
  if (credentialPayload.issuanceDate) {
    payload.nbf = Math.round(
      Date.parse(credentialPayload.issuanceDate.toString()) / 1000
    )
  }
  if (credentialPayload.expirationDate) {
    payload.exp = Math.round(
      Date.parse(credentialPayload.expirationDate.toString()) / 1000
    )
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
 * Determines if a given credential is expired
 */
export function isExpired(credential: Verifiable<W3CCredential>): boolean {
  if (!credential.expirationDate) {
    return false
  }

  const expirationDate = new Date(credential.expirationDate)
  return expirationDate < new Date()
}

/**
 * Given a verifiable credential, check if it has been revoked.
 *
 * @returns true if the credential is revoked, false otherwise
 */
export async function isRevoked(
  credential: Verifiable<W3CCredential> | RevocableCredential,
  revocationStatusList?: StatusList2021Credential
): Promise<boolean> {
  /**
   * If the credential is not revocable, it can not be revoked
   */
  if (!isRevocable(credential)) {
    return false
  }

  const revocableCredential = credential as RevocableCredential
  const statusList =
    revocationStatusList || (await fetchStatusList(revocableCredential))

  /**
   * If we are unable to fetch a status list for this credential, we can not
   * know if it is revoked.
   */
  if (!statusList) {
    return false
  }

  const list = BitBuffer.fromBitstring(statusList.credentialSubject.encodedList)

  const index = parseInt(
    (credential as RevocableCredential).credentialStatus.statusListIndex,
    10
  )

  return list.test(index)
}

/**
 * Performs an HTTP request to fetch the revocation status list for a credential.
 *
 * @returns the encoded status list, if present
 */
export async function fetchStatusList(
  credential: MaybeRevocableCredential
): Promise<StatusList2021Credential | undefined> {
  /**
   * If the credential is not revocable, it can not be revoked
   */
  if (!isRevocable(credential)) {
    return
  }

  const url = (credential as RevocableCredential).credentialStatus
    .statusListCredential

  try {
    const response = await fetch(url)

    if (response.status === 200) {
      const vcJwt = await response.text()

      return verifyVerifiableCredential(
        vcJwt
      ) as Promise<StatusList2021Credential>
    }
  } catch (e) {}
}

/**
 * Determine if a given credential is revocable or not.
 *
 * @returns true if the credential is revocable, false otherwise
 */
export const isRevocable = (
  credential: Verifiable<W3CCredential> | RevocableCredential
): credential is RevocableCredential => {
  return has(credential, "credentialStatus.statusListIndex")
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
  // eslint-disable-next-line no-prototype-builtins
  if (!vcPayload.hasOwnProperty("vc")) {
    payload = asJwtCredentialPayload(vcPayload as CredentialPayload)
  }

  return createVerifiableCredentialJwt(payload, issuer, options)
}

/**
 * Verifies a JWT with a Verifiable Credential payload.
 */
export async function verifyVerifiableCredential(
  vcJwt: JWT
): Promise<
  Verifiable<W3CCredential> | RevocableCredential | StatusList2021Credential
> {
  try {
    const res = await verifyCredential(vcJwt, didResolver)

    // check expired
    if (isExpired(res.verifiableCredential)) {
      throw new VerificationError("Expired Credential")
    }

    // check revocation
    if (await isRevoked(res.verifiableCredential)) {
      throw new VerificationError("Revoked Credential")
    }

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
  vpPayload: JwtPresentationPayload,
  issuer: Issuer,
  options: CreatePresentationOptions = {}
): Promise<JWT> {
  // TODO: also accept PresentationPayload?
  return createVerifiablePresentationJwt(vpPayload, issuer, options)
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
