import { createVerifiableCredentialJwt } from "did-jwt-vc"
import fetch from "isomorphic-unfetch"
import { has } from "lodash"

import {
  decodeVerifiableCredential,
  expandBitstring,
  generateBitstring
} from "../utils"

import type {
  CredentialPayload,
  EncodedRevocationListCredential,
  Issuer,
  MaybeRevocableCredential,
  RevocableCredential,
  RevocationList,
  RevocationListCredential,
  Verifiable,
  W3CCredential
} from "../../types"

type GenerateRevocationListOptions = {
  /**
   * The existing revocation status list to use as a base
   */
  statusList: number[]
  /**
   * The revocation status list URL, which serves as the list ID
   */
  url: string
  /**
   * The issuer DID
   */
  issuer: string
  /**
   * The credential signer
   */
  signer: Issuer
  /**
   * The creation date of this revocation list. Defaults to now
   */
  issuanceDate?: Date
}

/**
 * Generate an encoded revocation list to store revocation status of a
 * credential.
 *
 * @returns a revocation list credential as a JWT consisting of the provided
 * status list
 */
export const generateEncodedRevocationList = async ({
  statusList,
  url,
  issuer,
  signer,
  issuanceDate
}: GenerateRevocationListOptions): Promise<EncodedRevocationListCredential> => {
  const encodedList = generateBitstring(statusList)

  const vcPayload: RevocationList<CredentialPayload> = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://w3id.org/vc-status-list-2021/v1"
    ],
    id: url,
    type: ["VerifiableCredential", "StatusList2021Credential"],
    issuer,
    issuanceDate: issuanceDate ?? new Date(),
    credentialSubject: {
      id: `${url}#list`,
      type: "RevocationList2021",
      encodedList
    }
  }

  return createVerifiableCredentialJwt(vcPayload, signer)
}

/**
 * Generate a decoded revocation list to store revocation status of a
 * credential.
 *
 * @returns a revocation list credential consisting of the provided status list
 */
export const generateRevocationList = async (
  opts: GenerateRevocationListOptions
): Promise<RevocationListCredential> => {
  const vcJwt = await generateEncodedRevocationList(opts)

  return decodeVerifiableCredential(vcJwt) as Promise<RevocationListCredential>
}

/**
 * Revoke a credential in a revocation list.
 *
 * @returns a revocation list credential with the provided credential revoked
 */
export const revokeCredential = async (
  credential: RevocableCredential,
  revocationList: RevocationListCredential,
  signer: Issuer
): Promise<RevocationListCredential> => {
  // If a credential does not have a credential status, it cannot be revoked.
  if (!isRevocable(credential)) {
    return revocationList
  }

  const statusList = expandBitstring(
    revocationList.credentialSubject.encodedList
  )
  const index = parseInt(credential.credentialStatus.statusListIndex, 10)
  statusList.push(index)

  return await generateRevocationList({
    statusList,
    url: revocationList.id,
    issuer: signer.did,
    signer
  })
}

/**
 * Revoke a credential in a revocation list.
 *
 * @remarks This method is safe to call on a credential that is not revocable,
 * and/or a credential that is not revoked.
 *
 * @returns a revocation list credential with the provided credential not revoked
 */
export const unrevokeCredential = async (
  credential: RevocableCredential,
  revocationList: RevocationListCredential,
  signer: Issuer
): Promise<RevocationListCredential> => {
  // If a credential does not have a credential status, it cannot be revoked.
  if (!isRevocable(credential)) {
    return revocationList
  }

  const statusList = expandBitstring(
    revocationList.credentialSubject.encodedList
  )
  const index = statusList.indexOf(
    parseInt(credential.credentialStatus.statusListIndex, 10)
  )
  if (index !== -1) {
    statusList.splice(index, 1)
  }

  return await generateRevocationList({
    statusList,
    url: revocationList.id,
    issuer: signer.did,
    signer
  })
}

/**
 * Given a verifiable credential, check if it has been revoked.
 *
 * @returns true if the credential is revoked, false otherwise
 */
export const isRevoked = async (
  credential: Verifiable<W3CCredential> | RevocableCredential,
  revocationStatusList?: RevocationListCredential
): Promise<boolean> => {
  // If there is no credentialStatus, assume not revoked
  if (!isRevocable(credential)) {
    return false
  }

  const revocableCredential = credential as RevocableCredential
  const statusList =
    revocationStatusList ?? (await fetchStatusList(revocableCredential))

  if (!statusList) {
    return false
  }

  const results = expandBitstring(statusList.credentialSubject.encodedList)

  const index = parseInt(
    (credential as RevocableCredential).credentialStatus.statusListIndex,
    10
  )

  return results.indexOf(index) !== -1
}

/**
 * Performs an HTTP request to fetch the revocation status list for a credential.
 *
 * @returns the encoded status list, if present
 */
export async function fetchStatusList(
  credential: MaybeRevocableCredential
): Promise<RevocationListCredential | undefined> {
  if (!isRevocable(credential)) {
    return
  }

  const url = (credential as RevocableCredential).credentialStatus
    .statusListCredential

  try {
    const response = await fetch(url)

    if (response.status === 200) {
      const vcJwt = await response.text()

      return decodeVerifiableCredential(
        vcJwt
      ) as Promise<RevocationListCredential>
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
): boolean => {
  return has(credential, "credentialStatus.statusListIndex")
}
