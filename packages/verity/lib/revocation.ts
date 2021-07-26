import { promisify } from "util"
import { deflate, unzip } from "zlib"
import { Bits } from "@fry/bits"
import { cloneDeep, has } from "lodash"
import {
  CredentialPayload,
  RevocableCredential,
  RevocationList,
  RevocationListCredential,
  Verifiable,
  W3CCredential
} from "../types"
import { CredentialSigner } from "./credential-signer"
import { decodeVerifiableCredential } from "./credentials"

const do_unzip = promisify(unzip)
const do_deflate = promisify(deflate)

/**
 * Generate a revocation list.
 */
export const generateRevocationList = async (
  credentials: number[],
  url: string,
  issuer: string,
  signer: CredentialSigner,
  issuanceDate = new Date()
): Promise<RevocationListCredential> => {
  const encodedList = await generateBitstring(credentials)

  const vcPayload: RevocationList<CredentialPayload> = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://w3id.org/vc-status-list-2021/v1"
    ],
    id: url,
    type: ["VerifiableCredential", "StatusList2021Credential"],
    issuer,
    issuanceDate,
    credentialSubject: {
      id: `${url}#list`,
      type: "RevocationList2021",
      encodedList
    }
  }

  const vcJwt = await signer.signVerifiableCredential(vcPayload)
  return decodeVerifiableCredential(vcJwt) as Promise<RevocationListCredential>
}

/**
 * Revoke a credential in a revocation list.
 */
export const revokeCredential = async (
  credential: RevocableCredential,
  statusList: RevocationListCredential,
  signer: CredentialSigner
): Promise<RevocationListCredential> => {
  // If a credential does not have a credential status, it cannot be revoked.
  if (!isRevocable(credential)) {
    return statusList
  }

  const oldList = await expandBitstring(
    statusList.credentialSubject.encodedList
  )

  const newIndex = parseInt(credential.credentialStatus.statusListIndex, 10)

  return updateRevocationList(signer, statusList, oldList.concat([newIndex]))
}

/**
 * Revoke a credential in a revocation list.
 */
export const unrevokeCredential = async (
  credential: RevocableCredential,
  statusList: RevocationListCredential,
  signer: CredentialSigner
): Promise<RevocationListCredential> => {
  // If a credential does not have a credential status, it cannot be revoked.
  if (!isRevocable(credential)) {
    return statusList
  }

  const oldList = await expandBitstring(
    statusList.credentialSubject.encodedList
  )
  const index = oldList.indexOf(
    parseInt(credential.credentialStatus.statusListIndex, 10)
  )
  if (index !== -1) {
    oldList.splice(index, 1)
  }

  return updateRevocationList(signer, statusList, oldList)
}

/**
 * Given a verififable credential, check if it has been revoked.
 */
export const isRevoked = async (
  credential: Verifiable<W3CCredential> | RevocableCredential,
  statusList: RevocationListCredential
): Promise<boolean> => {
  // If there is no credentialStatus, assume not revoked
  if (!isRevocable(credential)) {
    return false
  }

  const results = await expandBitstring(
    statusList.credentialSubject.encodedList
  )
  const index = parseInt(
    (credential as RevocableCredential).credentialStatus.statusListIndex,
    10
  )

  return results.indexOf(index) !== -1
}

export const isRevokedIndex = async (
  index: number,
  statusList: RevocationListCredential
): Promise<boolean> => {
  const results = await expandBitstring(
    statusList.credentialSubject.encodedList
  )

  return results.indexOf(index) !== -1
}

/**
 * Apply zlib compression with Base64 encoding
 */
export const compress = async (
  input: string | ArrayBuffer
): Promise<string> => {
  const deflated = await do_deflate(input)
  return deflated.toString("base64")
}

/**
 * Given the base64 encoded revocation list, decode and unzip it to a Buffer
 */
export const decompress = async (input: string): Promise<Buffer> => {
  const buffer = Buffer.from(input, "base64")
  return do_unzip(buffer)
}

/**
 * Given a list of index values, generate the compressed bitstring
 */
export const generateBitstring = async (
  indicies: number[]
): Promise<string> => {
  const bits = new Bits(16_384 * 8) // 16KB
  indicies.forEach((index) => bits.setBit(index))
  return compress(bits.buffer)
}

/**
 * Given a bitstring, expand to list of revoked indexes.
 */
export const expandBitstring = async (string: string): Promise<number[]> => {
  const buffer = await decompress(string)
  const bools = expandBitstringToBooleans(buffer)
  const result = []
  bools.forEach((b, index) => {
    if (b) {
      result.push(index)
    }
  })
  return result
}

/**
 * Map the bitstring to a list of booleans. This is a very simple approach and
 * not a very performant.
 */
export const expandBitstringToBooleans = (bitstring: Buffer): boolean[] => {
  const bits = new Bits(bitstring)
  const results = []
  for (let i = 0; i < bitstring.byteLength * 8; i++) {
    results[i] = bits.testBit(i)
  }
  return results
}

/**
 * Determine if a given credential is revocable or not.
 */
export const isRevocable = (
  credential: Verifiable<W3CCredential> | RevocableCredential
): boolean => {
  return has(credential, "credentialStatus.statusListIndex")
}

/**
 * Generate a new RevocationList given an update list
 */
async function updateRevocationList(
  signer: CredentialSigner,
  statusList: RevocationListCredential,
  list: number[]
): Promise<RevocationListCredential> {
  const newPayload = cloneDeep(statusList)
  const newEncodedList = await generateBitstring(list)
  newPayload.credentialSubject.encodedList = newEncodedList

  const vcJwt = await signer.signVerifiableCredential(newPayload)
  return decodeVerifiableCredential(vcJwt) as Promise<RevocationListCredential>
}
