import * as ed25519 from "@stablelib/ed25519"
import * as didKeyEd25519 from "@transmute/did-key-ed25519"
import { EdDSASigner } from "did-jwt"
import { Resolvable, DIDResolutionResult } from "did-resolver"
import Multibase from "multibase"
import Multicodec from "multicodec"
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
    controller: controller,
    publicKey: key.publicKey,
    privateKey: key.secretKey
  }
}

/**
 * Convert a `DidKey` object to an `Issuer` instance
 *
 * @returns an `Issuer` instance using the `DidKey` private key
 */
export function didKeyToIssuer(didKey: DidKey): Issuer {
  return buildIssuer(didKey.controller, didKey.privateKey)
}

export function buildIssuer(
  did: string,
  privateKey: string | Uint8Array
): Issuer {
  return {
    did: did,
    signer: EdDSASigner(privateKey),
    alg: "EdDSA"
  }
}

/**
 * A did:key resolver that adheres to the `did-resolver` API.
 *
 * @remark This resolver is used to verify the signature of a did:key JWT.
 */
export const didKeyResolver: Resolvable = {
  resolve: async (didUrl: string): Promise<DIDResolutionResult> => {
    const result = await didKeyEd25519.resolve(didUrl)

    return {
      didResolutionMetadata: {},
      didDocument: result.didDocument,
      didDocumentMetadata: {}
    }
  }
}
