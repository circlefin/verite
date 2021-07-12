import { randomBytes } from "crypto"
import * as ed25519 from "@stablelib/ed25519"
import * as didKeyEd25519 from "@transmute/did-key-ed25519"
import {
  Resolvable,
  DIDResolutionResult,
  DIDResolutionOptions
} from "did-resolver"
import Multibase from "multibase"
import Multicodec from "multicodec"

export interface DidKey {
  id: string
  controller: string
  publicKey: Uint8Array
  privateKey: Uint8Array
}

/**
 * Returns a did:key for a given a seed function.
 */
export const generateDidKey = ({
  secureRandom
}: {
  secureRandom: () => Uint8Array
}): DidKey => {
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
export const randomDidKey = (): DidKey => {
  const secureRandom = () => new Uint8Array(randomBytes(32))
  return generateDidKey({ secureRandom })
}

/**
 * did:key resolver that adheres to the `did-resolver` API.
 *
 * The interfaces look near identical, but Typescript is requiring we do this.
 */
export const resolver: Resolvable = {
  resolve: async (
    didUrl: string,
    _options?: DIDResolutionOptions
  ): Promise<DIDResolutionResult> => {
    const result = await didKeyEd25519.resolve(didUrl)

    return {
      didResolutionMetadata: {},
      didDocument: result.didDocument,
      didDocumentMetadata: {}
    }
  }
}
