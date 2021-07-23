import { promisify } from "util"
import { deflate, unzip } from "zlib"
import { Bits } from "@fry/bits"
import { JwtCredentialPayload, Verifiable, W3CCredential } from "../types"
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
  issued = new Date()
): Promise<Verifiable<W3CCredential>> => {
  const encodedList = await generateBitstring(credentials)

  const vcPayload: JwtCredentialPayload = {
    vc: {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://w3id.org/vc-status-list-2021/v1"
      ],
      id: `${url}`,
      type: ["VerifiableCredential", "StatusList2021Credential"],
      issuer,
      issued,
      credentialSubject: {
        id: `${url}#list`,
        type: "RevocationList2021",
        encodedList
      }
    }
  }

  const vcJwt = await signer.signVerifiableCredential(vcPayload)
  const decoded = await decodeVerifiableCredential(vcJwt)
  return decoded.verifiableCredential
}

/**
 * Revoke a credential in a revocation list.
 */
export const revokeCredential = async (
  credential: Verifiable<W3CCredential>,
  statusList: Verifiable<W3CCredential>,
  signer: CredentialSigner
): Promise<W3CCredential> => {
  // If a credential does not have a credential status, it cannot be revoked.
  if (!credential.verifiableCredential.credentialStatus) {
    return statusList
  }

  const oldList = await expandBitstring(
    statusList.payload.vc.credentialSubject.encodedList
  )
  const newList = await generateBitstring(
    oldList.concat([
      credential.verifiableCredential.credentialStatus.statusListIndex
    ])
  )

  const newPayload = statusList.payload
  newPayload.vc.credentialSubject.encodedList = newList
  const vcJwt = await signer.signVerifiableCredential(newPayload)
  const decoded = await decodeVerifiableCredential(vcJwt)
  return decoded.verifiableCredential
}

/**
 * Revoke a credential in a revocation list.
 */
export const unrevokeCredential = async (
  credential: Verifiable<W3CCredential>,
  statusList: Verifiable<W3CCredential>,
  signer: CredentialSigner
): Promise<W3CCredential> => {
  // If a credential does not have a credential status, it cannot be revoked.
  if (!credential.verifiableCredential.credentialStatus) {
    return statusList
  }

  const oldList = await expandBitstring(
    statusList.payload.vc.credentialSubject.encodedList
  )
  const index = oldList.indexOf(
    credential.verifiableCredential.credentialStatus.statusListIndex
  )
  if (index !== -1) {
    oldList.splice(index, 1)
  }
  const newList = await generateBitstring(oldList)

  const newPayload = statusList.payload
  newPayload.vc.credentialSubject.encodedList = newList
  const vcJwt = await signer.signVerifiableCredential(newPayload)
  const decoded = await decodeVerifiableCredential(vcJwt)
  return decoded.verifiableCredential
}

/**
 * Given a verififable credential, check if it has been revoked.
 */
export const isRevoked = async (
  credential: Verifiable<W3CCredential>,
  statusList: Verifiable<W3CCredential>
): Promise<boolean> => {
  // If there is no credentialStatus, assume not revoked
  if (!credential.verifiableCredential.credentialStatus) {
    return false
  }

  const results = await expandBitstring(
    statusList.payload.vc.credentialSubject.encodedList
  )
  const index = credential.payload.vc.credentialStatus.statusListIndex

  return results.indexOf(index) !== -1
}

export const isRevokedIndex = async (
  index: number,
  statusList: Verifiable<W3CCredential>
): Promise<boolean> => {
  const results = await expandBitstring(
    statusList.payload.vc.credentialSubject.encodedList
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
  return await do_unzip(buffer)
}

/**
 * Given a list of index values, generate the compressed bitstring
 */
export const generateBitstring = async (
  indicies: number[]
): Promise<string> => {
  const bits = new Bits(16_384 * 8) // 16KB
  indicies.forEach((index) => bits.setBit(index))
  return await compress(bits.buffer)
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
