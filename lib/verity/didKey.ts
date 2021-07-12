import { randomBytes } from "crypto"
import * as ed25519 from "@stablelib/ed25519"
import * as didKeyEd25519 from "@transmute/did-key-ed25519"
import { EdDSASigner } from "did-jwt"
import { Issuer } from "did-jwt-vc"
import { Resolvable, DIDResolutionResult } from "did-resolver"
import Multibase from "multibase"
import Multicodec from "multicodec"

export type DidKey = {
  id: string
  controller: string
  publicKey: Uint8Array
  privateKey: Uint8Array
}

type DidKeyParams = {
  secureRandom: () => Uint8Array
}

/**
 * Returns a did:key for a given a seed function.
 */
export function generateDidKey({ secureRandom }: DidKeyParams): DidKey {
  const key = ed25519.generateKeyPair({
    isAvailable: true,
    randomBytes: secureRandom
  })

  const methodSpecificId = Buffer.from(
    Multibase.encode(
      "base58btc",
      Multicodec.addPrefix("ed25519-pub", Buffer.from(key.publicKey))
    )
  ).toString()

  const controller = `did:key:${methodSpecificId}`
  const id = `${controller}#${methodSpecificId}`

  return {
    id: id,
    controller: controller,
    publicKey: key.publicKey,
    privateKey: key.secretKey
  }
}

/**
 * Returns a did:key with a random seed.
 */
export function randomDidKey(): DidKey {
  const secureRandom = () => new Uint8Array(randomBytes(32))
  return generateDidKey({ secureRandom })
}

/**
 * Returns an `Issuer` instance for a given did:key
 */
export function didKeyToIssuer(didKey: DidKey): Issuer {
  return {
    did: didKey.controller,
    signer: EdDSASigner(didKey.privateKey),
    alg: "EdDSA"
  }
}

/**
 * did:key resolver that adheres to the `did-resolver` API.
 *
 * The interfaces look near identical, but Typescript is requiring we do this.
 */
export const didKeyResolver: Resolvable = {
  resolve: async (didUrl: string): Promise<DIDResolutionResult> => {
    const result = await didKeyEd25519.resolve(didUrl)

    return {
      didResolutionMetadata: result.didResolutionMetadata,
      didDocument: result.didDocument,
      didDocumentMetadata: result.didDocumentMetadata
    }
  }
}
