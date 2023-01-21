import { BitBuffer } from "bit-buffers"
import fetch from "cross-fetch"
import { has } from "lodash"

import {
  encodeVerifiableCredential,
  decodeVerifiableCredential,
  generateBitstring
} from "../utils"

import type {
  CredentialPayload,
  EncodedStatusListCredential,
  Issuer,
  MaybeRevocableCredential,
  RevocableCredential,
  StatusList,
  StatusList2021Credential,
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
}: GenerateRevocationListOptions): Promise<EncodedStatusListCredential> => {
  const encodedList = generateBitstring(statusList)

  const vcPayload: StatusList<CredentialPayload> = {
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
      type: "StatusList2021",
      statusPurpose: "revocation",
      encodedList
    }
  }

  return encodeVerifiableCredential(vcPayload, signer)
}

/**
 * Generate a decoded revocation list to store revocation status of a
 * credential.
 *
 * @returns a revocation list credential consisting of the provided status list
 */
export const generateRevocationList = async (
  opts: GenerateRevocationListOptions
): Promise<StatusList2021Credential> => {
  const vcJwt = await generateEncodedRevocationList(opts)

  return decodeVerifiableCredential(vcJwt) as Promise<StatusList2021Credential>
}

/**
 * Revoke a credential in a revocation list.
 *
 * @returns a revocation list credential with the provided credential revoked
 */
export const revokeCredential = async (
  credential: RevocableCredential,
  revocationList: StatusList2021Credential,
  signer: Issuer
): Promise<StatusList2021Credential> => {
  /**
   * If the credential is not revocable, it can not be revoked
   */
  if (!isRevocable(credential)) {
    return revocationList
  }

  const indexArray = BitBuffer.fromBitstring(
    revocationList.credentialSubject.encodedList
  ).toIndexArray()

  const index = parseInt(credential.credentialStatus.statusListIndex, 10)
  indexArray.push(index)

  return await generateRevocationList({
    statusList: indexArray,
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
  revocationList: StatusList2021Credential,
  signer: Issuer
): Promise<StatusList2021Credential> => {
  /**
   * If the credential is not revocable, it can not be revoked
   */
  if (!isRevocable(credential)) {
    return revocationList
  }

  const indexArray = BitBuffer.fromBitstring(
    revocationList.credentialSubject.encodedList
  ).toIndexArray()

  const index = indexArray.indexOf(
    parseInt(credential.credentialStatus.statusListIndex, 10)
  )

  if (index !== -1) {
    indexArray.splice(index, 1)
  }

  return await generateRevocationList({
    statusList: indexArray,
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
  revocationStatusList?: StatusList2021Credential
): Promise<boolean> => {
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

      return decodeVerifiableCredential(
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
