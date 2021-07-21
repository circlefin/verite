import { Bits } from "@fry/bits"
import {
  JwtCredentialPayload
} from "did-jwt-vc"
import {
  asyncMap,
  CredentialSigner,
  generateRevocationList,
  decodeVerifiableCredential,
  expandBitstring, expandBitstringToBooleans, generateBitstring, compress, decompress, isRevoked
} from "lib/verity"

/**
 * Helper to create a Buffer with the bits set to 1 at the indices given.
 */
  const indices2Buffer = (indices: number[], bitlength = 16): Buffer => {
  const bits = new Bits(bitlength)

  indices.forEach(credential => {
    bits.setBit(credential)
  });

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
    bitstring: "H4sIAAAAAAAAA-3BMQEAAADCoPVPbQsvoAAAAAAAAAAAAAAAAP4GcwM92tQwAAA"
  }
]

describe("Status List 2021", () => {
  it("compress", async () => {
    const value = await compress(".................................")
    expect(value).toBe("eJzT0yMAAGTvBe8=")
  })

  it("decompress", async () => {
    const value = await decompress("eJzT0yMAAGTvBe8=")
    expect(value.toString()).toBe(".................................")
  })

  it("generateRevocationList", async () => {
    const revoke = [3]
    const url = "https://example.com/credentials/status/3" // Need to create a list
    const issuer = process.env.ISSUER_DID
    const signer = new CredentialSigner(process.env.ISSUER_DID, process.env.ISSUER_SECRET)
    const issued = new Date()

    const vc = await generateRevocationList(revoke, url, issuer, signer, issued)
    expect(vc.payload.vc.id).toBe(`${url}#list`)
    expect(vc.payload.vc.issuer).toBe(issuer)
    expect(vc.payload.vc.issued).toBe(issued.toISOString())
    expect(vc.payload.vc.credentialSubject.type).toBe("RevocationList2021")
    expect(vc.payload.vc.credentialSubject.encodedList).toBe("eJztwSEBAAAAAiAn+H+tMyxAAwAAAAAAAAAAAAAAAAAAALwNQDwAEQ==")
  })

  describe("#isRevoked", () => {
    it("returns false if the given credential has no credentialStatus", async () => {
      const revoke = [3]
      const url = "https://example.com/credentials/status/3" // Need to create a list
      const issuer = process.env.ISSUER_DID
      const signer = new CredentialSigner(process.env.ISSUER_DID, process.env.ISSUER_SECRET)
      const issued = new Date()

      const statusList = await generateRevocationList(revoke, url, issuer, signer, issued)

      const vcPayload: JwtCredentialPayload = {
        vc: {
          "@context": [
            "https://www.w3.org/2018/credentials/v1"
          ],
          sub: "did:web:m2.xyz",
          type: ["VerifiableCredential"],
          credentialSubject: {
            id: "did:web:m2.xyz",
            foo: "bar"
          }
        }
      }
      const vcJwt = await signer.signVerifiableCredential(vcPayload)
      const credential = await decodeVerifiableCredential(vcJwt)


      const revoked = await isRevoked(credential, statusList)
      expect(revoked).toBe(false)
    })

    it("returns false if the given credential has a credentialSubject that is not revoked", async () => {
      const revoke = []
      const url = "https://example.com/credentials/status/3" // Need to create a list
      const issuer = process.env.ISSUER_DID
      const signer = new CredentialSigner(process.env.ISSUER_DID, process.env.ISSUER_SECRET)
      const issued = new Date()

      const statusList = await generateRevocationList(revoke, url, issuer, signer, issued)
      const index = 3

      const vcPayload: JwtCredentialPayload = {
        vc: {
          "@context": [
            "https://www.w3.org/2018/credentials/v1"
          ],
          sub: "did:web:m2.xyz",
          type: ["VerifiableCredential"],
          credentialSubject: {
            id: "did:web:m2.xyz",
            foo: "bar"
          },
          credentialStatus: {
            "id": `${url}#${index}`,
            "type": "RevocationList2021Status",
            "statusListIndex": index,
            "statusListCredential": url
          }
        }
      }
      const vcJwt = await signer.signVerifiableCredential(vcPayload)
      const credential = await decodeVerifiableCredential(vcJwt)

      const revoked = await isRevoked(credential, statusList)
      expect(revoked).toBe(false)
    })

    it("returns true if the given credential has a revoked", async () => {
      const revoke = [3]
      const url = "https://example.com/credentials/status/3" // Need to create a list
      const issuer = process.env.ISSUER_DID
      const signer = new CredentialSigner(process.env.ISSUER_DID, process.env.ISSUER_SECRET)
      const issued = new Date()

      const statusList = await generateRevocationList(revoke, url, issuer, signer, issued)
      const index = 3

      const vcPayload: JwtCredentialPayload = {
        vc: {
          "@context": [
            "https://www.w3.org/2018/credentials/v1"
          ],
          sub: "did:web:m2.xyz",
          type: ["VerifiableCredential"],
          credentialSubject: {
            id: "did:web:m2.xyz",
            foo: "bar"
          },
          credentialStatus: {
            "id": `${url}#${index}`,
            "type": "RevocationList2021Status",
            "statusListIndex": index,
            "statusListCredential": url
          }
        }
      }
      const vcJwt = await signer.signVerifiableCredential(vcPayload)
      const credential = await decodeVerifiableCredential(vcJwt)

      const revoked = await isRevoked(credential, statusList)
      expect(revoked).toBe(true)
    })
  })

  it("generateBitstring", async () => {
    await asyncMap(vectors, async vector => {
      const {credentials, bitstring, skipGenerate} = vector

      if (skipGenerate) {
        return
      }

      const encodedList = await generateBitstring(credentials)
      expect(encodedList).toEqual(bitstring)
    })
  })

  it("expandBitstring", async () => {
    await asyncMap(vectors, async vector => {
      const {credentials, bitstring} = vector

      const decodedList = await expandBitstring(bitstring)
      expect(decodedList).toEqual(credentials)
    })
  })

  it("expandBitstringToBooleans", async () => {
    const buffer=indices2Buffer([0,1,15], 16)
    expect(expandBitstringToBooleans(buffer)).toEqual([true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, true])
  })

})
