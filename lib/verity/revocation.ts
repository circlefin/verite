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

export const compress = async (input: Buffer): Promise<string> => {
  const deflated = await do_deflate(input)
  return deflated.toString("base64")
}

export const decompress = async (input: string): Promise<Buffer> => {
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

  const encoded = await compress(bits.buffer)

  // Create 16KB buffer initialized with 0. Use 131,072 length
  // For each credential:
  // 1) Update buffer at credential's revocation index to be a 1
  // ZLIB compression rfc1950
  // BASE64 encode
  return encoded
}

/**
 * Given a string, expand to uncompressed bitstring
 */
export const expandBitstring = async (string: string): Promise<boolean[]> => {
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

export const expandBitstringToBooleans = (bitstring: Buffer): boolean[] => {
  const bits = new Bits(bitstring)
  const results = []
  for (let i = 0; i< bitstring.length * 8; i++) {
    results[i] = bits.testBit(i)
  }
  return results
}
