import { promisify } from "util"
import {
  deflate, unzip
} from "zlib"
import { Bits } from "@fry/bits"
import {
  Verifiable,
  W3CCredential,
  JwtCredentialPayload
} from "did-jwt-vc"

const do_unzip = promisify(unzip);
const do_deflate = promisify(deflate);

/**
 * Issuer needs to persist for each list:
 * 1) A url
 * 2) The date the list was issued
 */
export const generateRevocationList = (credentials): Verifiable<W3CCredential> => {
  const url = "https://example.com/credentials/status/3" // Need to create a list
  const issued = "2021-04-05T14:27:40Z"
  const issuer = process.env.ISSUER_DID

  const encodedList = generateBitstring(credentials)

  const vcPayload: JwtCredentialPayload = {
    vc: {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://w3id.org/vc-status-list-2021/v1"
      ],
      id: url,
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



  return null
}

/**
 * Given a verififable credential, check if it has been revoked.
 */
export const validateCredential = (credential): boolean => {
  return true
}

export const compress = async (input) => {
  const deflated = await do_deflate(input)
  return deflated.toString("base64")
}

export const decompress = async (input) => {
  const buffer = Buffer.from(input, 'base64');
  return await do_unzip(buffer)
}

/**
 * Given a list of credentials, generate the compressed bitstring
 */
export const generateBitstring = async (credentials: number[]): Promise<string> => {
  const bits = new Bits(16_384*8)

  credentials.forEach(credential => {
    bits.setBit(credential)
  });

  const encoded = await compress(bits.toString())

  // Create 16KB buffer initialized with 0. Use 131,072 length
  // For each credential:
  // 1) Update buffer at credential's revocation index to be a 1
  // ZLIB compression rfc1950
  // BASE64 encode
  return encoded
}

/**
 * Given a compressed bitstring, expand to uncompressed bitstring
 */
export const expandBitstring = async (string): Promise<Buffer> => {
  const buffer = await decompress(string)

  // buffer

  // BASE64 decode
  // ZLIB decompress
  // Map to true/false
  return buffer
}

/**
 * Map a bitstring to an array of booleans.
 *
 * 1. Load buffer into Uint8Array. Each index of this array is an unsigned 8-bit number.
 * 2. Read the value of each bit using a bitmask at each position.
 */
export const expandBitstringToBooleans = (bitstring: ArrayBuffer): boolean[] => {
  const view = new Uint8Array(bitstring)
  const results = []
  view.forEach((i) => {
    [0x1, 0x2, 0x4, 0x8, 0x10, 0x20, 0x40, 0x80].forEach(j => {
      results.push(Boolean(i & j))
    })
  })
  return results
}

export const expandBitstringToBooleans2 = (bitstring: Buffer): boolean[] => {
  const bits = new Bits(bitstring)
  const results = []
  for (let i = 0; i<16_384 * 8; i++) {
    results[i] = bits.testBit(i)
  }
  return results
}
