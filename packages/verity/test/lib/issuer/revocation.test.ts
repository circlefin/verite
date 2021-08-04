import { Bits } from "@fry/bits"
import {
  generateRevocationList,
  isRevoked,
  revokeCredential,
  unrevokeCredential
} from "../../../lib/issuer"
import {
  asyncMap,
  compress,
  decompress,
  decodeVerifiableCredential,
  expandBitstring,
  expandBitstringToBooleans,
  generateBitstring,
  buildIssuer,
  signVerifiableCredential
} from "../../../lib/utils"
import type {
  CredentialPayload,
  Issuer,
  Revocable,
  RevocableCredential
} from "../../../types"

/**
 * Helper to create a Buffer with the bits set to 1 at the indices given.
 */
const indices2Buffer = (indices: number[], bitlength = 16): Buffer => {
  const bits = new Bits(bitlength)

  indices.forEach((credential) => {
    bits.setBit(credential)
  })

  return bits.buffer
}

const vectors = [
  {
    credentials: [],
    bitstring: "eJztwTEBAAAAwqD1T20MH6AAAAAAAAAAAAAAAAAAAACAtwFAAAAB"
  },
  {
    credentials: [0],
    bitstring: "eJztwSEBAAAAAiCnO90ZFqABAAAAAAAAAAAAAAAAAAAA3gZB4ACB"
  },
  {
    credentials: [3], // zero index
    bitstring: "eJztwSEBAAAAAiAn+H+tMyxAAwAAAAAAAAAAAAAAAAAAALwNQDwAEQ=="
  },
  {
    skipGenerate: true, // When I generate a bitstring, I get the string found in the first vector. However, both these values decode to the same empty array.
    credentials: [],
    bitstring:
      "H4sIAAAAAAAAA-3BMQEAAADCoPVPbQsvoAAAAAAAAAAAAAAAAP4GcwM92tQwAAA="
  }
]

const credentialFactory = async (
  index: number,
  signer: Issuer
): Promise<RevocableCredential> => {
  const vcPayload: Revocable<CredentialPayload> = {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    sub: "did:web:m2.xyz",
    type: ["VerifiableCredential"],
    issuer: signer.did,
    issuanceDate: new Date(),
    credentialSubject: {
      id: "did:web:m2.xyz",
      foo: "bar"
    },
    credentialStatus: {
      id: `http://example.com/revocation#${index}`,
      type: "RevocationList2021Status",
      statusListIndex: index.toString(),
      statusListCredential: "http://example.com/revocation"
    }
  }
  const vcJwt = await signVerifiableCredential(signer, vcPayload)
  return decodeVerifiableCredential(vcJwt) as Promise<RevocableCredential>
}

const statusListFactory = async (credentials: number[]) => {
  const revoke = credentials
  const url = "https://example.com/credentials/status/3" // Need to create a list
  const issuer = "did:key:z6MksGKh23mHZz2FpeND6WxJttd8TWhkTga7mtbM1x1zM65m"
  const signer = buildIssuer(
    "did:key:z6MksGKh23mHZz2FpeND6WxJttd8TWhkTga7mtbM1x1zM65m",
    "1f0465e2546027554c41584ca53971dfc3bf44f9b287cb15b5732ad84adb4e63be5aa9b3df96e696f4eaa500ec0b58bf5dfde59200571b44288cc9981279a238"
  )
  const issued = new Date()

  return generateRevocationList(revoke, url, issuer, signer, issued)
}

describe("Status List 2021", () => {
  it("compress periods", () => {
    const value = compress(".................................")
    expect(value).toBe("eJzT0yMAAGTvBe8=")
  })

  it("decompress", () => {
    const value = decompress("eJzT0yMAAGTvBe8=")
    expect(value.toString()).toBe(".................................")
  })

  it("generateRevocationList", async () => {
    const revoke = [3]
    const url = "https://example.com/credentials/status/3" // Need to create a list
    const issuer = "did:key:z6MksGKh23mHZz2FpeND6WxJttd8TWhkTga7mtbM1x1zM65m"

    const vc = await statusListFactory(revoke)
    expect(vc.id).toBe(`${url}`)
    expect(vc.issuer.id).toBe(issuer)
    expect(vc.credentialSubject.type).toBe("RevocationList2021")
    expect(vc.credentialSubject.encodedList).toBe(
      "eJztwSEBAAAAAiAn+H+tMyxAAwAAAAAAAAAAAAAAAAAAALwNQDwAEQ=="
    )
  })

  describe("#isRevoked", () => {
    it("returns false if the given credential has no credentialStatus", async () => {
      const revoke = [3]
      const url = "https://example.com/credentials/status/3" // Need to create a list
      const issuer = "did:key:z6MksGKh23mHZz2FpeND6WxJttd8TWhkTga7mtbM1x1zM65m"
      const signer = buildIssuer(
        "did:key:z6MksGKh23mHZz2FpeND6WxJttd8TWhkTga7mtbM1x1zM65m",
        "1f0465e2546027554c41584ca53971dfc3bf44f9b287cb15b5732ad84adb4e63be5aa9b3df96e696f4eaa500ec0b58bf5dfde59200571b44288cc9981279a238"
      )
      const issued = new Date()

      const statusList = await generateRevocationList(
        revoke,
        url,
        issuer,
        signer,
        issued
      )

      const vcPayload: CredentialPayload = {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        sub: "did:web:m2.xyz",
        type: ["VerifiableCredential"],
        issuer,
        issuanceDate: issued,
        credentialSubject: {
          id: "did:web:m2.xyz",
          foo: "bar"
        }
      }
      const vcJwt = await signVerifiableCredential(signer, vcPayload)
      const credential = await decodeVerifiableCredential(vcJwt)

      const revoked = await isRevoked(credential, statusList)
      expect(revoked).toBe(false)
    })

    it("returns false if the given credential has a credentialSubject that is not revoked", async () => {
      const revokedCredentials: number[] = []
      const url = "https://example.com/credentials/status/3" // Need to create a list
      const issuer = "did:key:z6MksGKh23mHZz2FpeND6WxJttd8TWhkTga7mtbM1x1zM65m"
      const signer = buildIssuer(
        "did:key:z6MksGKh23mHZz2FpeND6WxJttd8TWhkTga7mtbM1x1zM65m",
        "1f0465e2546027554c41584ca53971dfc3bf44f9b287cb15b5732ad84adb4e63be5aa9b3df96e696f4eaa500ec0b58bf5dfde59200571b44288cc9981279a238"
      )
      const issued = new Date()

      const statusList = await generateRevocationList(
        revokedCredentials,
        url,
        issuer,
        signer,
        issued
      )
      const index = 3

      const vcPayload: Revocable<CredentialPayload> = {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        sub: "did:web:m2.xyz",
        type: ["VerifiableCredential"],
        issuer,
        issuanceDate: new Date(),
        credentialSubject: {
          id: "did:web:m2.xyz",
          foo: "bar"
        },
        credentialStatus: {
          id: `${url}#${index}`,
          type: "RevocationList2021Status",
          statusListIndex: index.toString(),
          statusListCredential: url
        }
      }
      const vcJwt = await signVerifiableCredential(signer, vcPayload)
      const credential = await decodeVerifiableCredential(vcJwt)

      const revoked = await isRevoked(credential, statusList)
      expect(revoked).toBe(false)
    })

    it("returns true if the given credential has a revoked", async () => {
      const revoke = [3]
      const url = "https://example.com/credentials/status/3" // Need to create a list
      const issuer = "did:key:z6MksGKh23mHZz2FpeND6WxJttd8TWhkTga7mtbM1x1zM65m"
      const signer = buildIssuer(
        "did:key:z6MksGKh23mHZz2FpeND6WxJttd8TWhkTga7mtbM1x1zM65m",
        "1f0465e2546027554c41584ca53971dfc3bf44f9b287cb15b5732ad84adb4e63be5aa9b3df96e696f4eaa500ec0b58bf5dfde59200571b44288cc9981279a238"
      )
      const issued = new Date()

      const statusList = await generateRevocationList(
        revoke,
        url,
        issuer,
        signer,
        issued
      )
      const index = 3

      const vcPayload: Revocable<CredentialPayload> = {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        sub: "did:web:m2.xyz",
        type: ["VerifiableCredential"],
        issuer,
        issuanceDate: new Date(),
        credentialSubject: {
          id: "did:web:m2.xyz",
          foo: "bar"
        },
        credentialStatus: {
          id: `${url}#${index}`,
          type: "RevocationList2021Status",
          statusListIndex: index.toString(),
          statusListCredential: url
        }
      }
      const vcJwt = await signVerifiableCredential(signer, vcPayload)
      const credential = await decodeVerifiableCredential(vcJwt)

      const revoked = await isRevoked(credential, statusList)
      expect(revoked).toBe(true)
    })
  })

  describe("revokeCredential", () => {
    it("updates the status list credential", async () => {
      const signer = buildIssuer(
        "did:key:z6MksGKh23mHZz2FpeND6WxJttd8TWhkTga7mtbM1x1zM65m",
        "1f0465e2546027554c41584ca53971dfc3bf44f9b287cb15b5732ad84adb4e63be5aa9b3df96e696f4eaa500ec0b58bf5dfde59200571b44288cc9981279a238"
      )

      const credential = await credentialFactory(3, signer)
      let statusList = await statusListFactory([])
      expect(await isRevoked(credential, statusList)).toBe(false)

      statusList = await revokeCredential(credential, statusList, signer)
      expect(await isRevoked(credential, statusList)).toBe(true)

      statusList = await unrevokeCredential(credential, statusList, signer)
      expect(await isRevoked(credential, statusList)).toBe(false)
    })
  })

  it("generateBitstring", async () => {
    await asyncMap(vectors, async (vector) => {
      const { credentials, bitstring, skipGenerate } = vector

      if (skipGenerate) {
        return
      }

      const encodedList = generateBitstring(credentials)
      expect(encodedList).toEqual(bitstring)
    })
  })

  it("expandBitstring", async () => {
    await asyncMap(vectors, async (vector) => {
      const { credentials, bitstring } = vector

      const decodedList = await expandBitstring(bitstring)
      expect(decodedList).toEqual(credentials)
    })
  })

  it("expandBitstringToBooleans", async () => {
    const buffer = indices2Buffer([0, 1, 15], 16)
    expect(expandBitstringToBooleans(buffer)).toEqual([
      true,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      true
    ])
  })
})
