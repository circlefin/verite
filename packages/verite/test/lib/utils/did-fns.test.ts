import { randomBytes } from "crypto"
import nock from "nock"

import {
  buildIssuer,
  didResolver,
  generateDidKey,
  randomDidKey
} from "../../../lib/utils/did-fns"

describe("generateDidKey()", () => {
  it("generates a DiKey from the given input", async () => {
    const bytes = Buffer.from(
      "2ac8ddd5cca1ce6030fe41576b70a4f2f000441f272aa6a623292806a103ce42",
      "hex"
    )

    const didKey = generateDidKey({ secureRandom: () => bytes })

    expect(didKey.publicKey).toBeDefined()
    expect(didKey.privateKey).toBeDefined()
    expect(didKey.controller.startsWith("did:key")).toBe(true)
    expect(didKey.subject.startsWith("did:key")).toBe(true)
    expect(didKey.id.startsWith(didKey.subject)).toBe(true)
  })
})

describe("buildIssuer()", () => {
  it("builds an Issuer object", async () => {
    const didKey = randomDidKey(randomBytes)
    const issuer = buildIssuer(didKey.subject, didKey.privateKey)
    expect(issuer.did).toBe(didKey.subject)
  })
})

describe("didResolver", () => {
  it("resolves did:key documents", async () => {
    const didKey = randomDidKey(randomBytes)

    const result = await didResolver.resolve(didKey.subject)
    expect(result).toBeTruthy()
    expect(result.didDocument).toBeDefined()
    expect(result.didDocument!.id).toEqual(didKey.subject)
  })

  it("resolves ed25519 did:keys", async () => {
    const didKey = "did:key:z6Mki9h85dnLq1gttLjXYJwT3xDi5CwRndULX4cZv2GiBYgX"

    const result = await didResolver.resolve(didKey)
    expect(result).toBeTruthy()
    expect(result.didDocument).toBeDefined()
    expect(result.didDocument!.verificationMethod![0].type).toEqual(
      "Ed25519VerificationKey2018"
    )
    expect(result.didDocument!.id).toEqual(didKey)
  })

  it("resolves a secp256k1 did:key", async () => {
    const didKey = "did:key:zQ3shhuRynQdg1csMfXHzxoxkNd7HXZZDYamWf2fzRQS7JqCS"

    const result = await didResolver.resolve(didKey)
    expect(result).toBeTruthy()
    expect(result.didDocument).toBeDefined()
    expect(result.didDocument!.verificationMethod![0].type).toEqual(
      "Secp256k1VerificationKey2018"
    )
    expect(result.didDocument!.id).toEqual(didKey)
  })

  it("resolves did:web documents", async () => {
    const didDocument = {
      "@context": "https://w3id.org/did/v1",
      id: "did:web:example.com",
      publicKey: [
        {
          id: "did:web:example.com#owner",
          type: "Secp256k1VerificationKey2018",
          controller: "did:web:example.com",
          publicKeyHex:
            "04ab0102bcae6c7c3a90b01a3879d9518081bc06123038488db9cb109b082a77d97ea3373e3dfde0eccd9adbdce11d0302ea5c098dbb0b310234c8689501749274"
        }
      ],
      authentication: [
        {
          type: "Secp256k1SignatureAuthentication2018",
          publicKey: "did:web:example.com#owner"
        }
      ]
    }

    nock("https://example.com")
      .get("/.well-known/did.json")
      .reply(200, JSON.stringify(didDocument))

    const result = await didResolver.resolve("did:web:example.com")
    expect(result).toBeTruthy()
    expect(result.didDocument).toEqual(didDocument)
    expect(result.didResolutionMetadata).toEqual({
      contentType: "application/did+ld+json"
    })
  })

  it("fails if given an invalid document", async () => {
    const result = await didResolver.resolve("invalid:did")
    expect(result.didDocument).toBeNull()
    expect(result.didResolutionMetadata).toEqual({
      error: "invalidDid"
    })
  })
})
