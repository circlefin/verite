import * as ed25519 from "@stablelib/ed25519"
import * as didKeyEd25519 from "@transmute/did-key-ed25519"
import { randomBytes } from "crypto"
import { EdDSASigner } from "did-jwt"
import { DIDResolutionResult, DIDResolver, Resolver } from "did-resolver"
import Multibase from "multibase"
import Multicodec from "multicodec"
import { getResolver as getWebResolver } from "web-did-resolver"

import type { DidKey, Issuer } from "../../types"

type GenerateDidKeyParams = {
  secureRandom: () => Uint8Array
}

/**
 * Generate a `DidKey` for a given a seed function.
 *
 * @returns a `DidKey` object containing public and private keys.
 */
export function generateDidKey({ secureRandom }: GenerateDidKeyParams): DidKey {
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
    subject: `did:key:${methodSpecificId}`,
    controller: controller,
    publicKey: key.publicKey,
    privateKey: key.secretKey
  }
}

/**
 * Returns a did:key with a random seed.
 *
 * @remarks This method should be used for testing purposes only.
 *
 * @returns a did:key with a random seed
 */
export function randomDidKey(): DidKey {
  const secureRandom = () => new Uint8Array(randomBytes(32))
  return generateDidKey({ secureRandom })
}

/**
 * Build an issuer from a did and private key
 */
export function buildIssuer(
  did: string,
  privateKey: string | Uint8Array
): Issuer {
  return {
    did,
    signer: EdDSASigner(privateKey),
    alg: "EdDSA"
  }
}

/**
 * A did:key resolver that adheres to the `did-resolver` API.
 *
 * @remark This resolver is used to verify the signature of a did:key JWT.
 */
export function getKeyResolver(): Record<string, DIDResolver> {
  async function resolve(did: string): Promise<DIDResolutionResult> {
    const result = await didKeyEd25519.resolve(did)

    return {
      didResolutionMetadata: {},
      didDocument: result.didDocument,
      didDocumentMetadata: {}
    }
  }

  return { key: resolve }
}

const didWebResolver = getWebResolver()
const didKeyResolver = getKeyResolver()

/**
 * A did resolver that handles both did:key and did:web
 */
export const didResolver = new Resolver({
  ...didWebResolver,
  ...didKeyResolver
})
