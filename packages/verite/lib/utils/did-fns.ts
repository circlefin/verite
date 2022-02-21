import {
  generateKeyPair as ed25519GenerateKeyPair,
  KeyPair
} from "@stablelib/ed25519"
import { EdDSASigner, ES256KSigner } from "did-jwt"
import { Resolver } from "did-resolver"
import { getResolver as getKeyResolver } from "key-did-resolver"
import Multibase from "multibase"
import Multicodec from "multicodec"
import secp256k1 from "secp256k1/elliptic"
import { getResolver as getWebResolver } from "web-did-resolver"

import type { DidKey, Issuer } from "../../types"

type Alg = "EdDSA" | "ES256K"
type RandomBytesMethod = (size: number) => Uint8Array
type GenerateDidKeyParams = {
  secureRandom: () => Uint8Array
  alg?: Alg
}

/**
 * Generate a `DidKey` for a given a seed function.
 *
 * @returns a `DidKey` object containing public and private keys.
 */
export function generateDidKey({
  secureRandom,
  alg
}: GenerateDidKeyParams): DidKey {
  const key =
    alg === "ES256K"
      ? secp256k1GenerateKeyPair(secureRandom)
      : ed25519GenerateKeyPair({
          isAvailable: true,
          randomBytes: secureRandom
        })

  const prefix = alg === "ES256K" ? "secp256k1-pub" : "ed25519-pub"
  const methodSpecificId = Buffer.from(
    Multibase.encode(
      "base58btc",
      Multicodec.addPrefix(prefix, Buffer.from(key.publicKey))
    )
  ).toString()

  const controller = `did:key:${methodSpecificId}`
  const id = `${controller}#${methodSpecificId}`

  return {
    id,
    controller,
    subject: `did:key:${methodSpecificId}`,
    publicKey: key.publicKey,
    privateKey: key.secretKey
  }
}

/**
 * Generate a secp256k1 key pair.
 */
function secp256k1GenerateKeyPair(secureRandom: RandomBytesMethod): KeyPair {
  const secretKey = new Uint8Array(secureRandom(32))
  const publicKey = secp256k1.publicKeyCreate(secretKey)
  return { publicKey, secretKey }
}

/**
 * Returns a did:key with a random seed.
 *
 * @remarks This method should be used for testing purposes only.
 *
 * @returns a did:key with a random seed
 */
export function randomDidKey(
  randomBytes: RandomBytesMethod,
  alg: Alg = "EdDSA"
): DidKey {
  const secureRandom = () => new Uint8Array(randomBytes(32))
  return generateDidKey({ alg, secureRandom })
}

/**
 * Build an issuer from a did and private key
 */
export function buildIssuer(
  did: string,
  privateKey: string | Uint8Array,
  alg: Alg = "EdDSA"
): Issuer {
  const signer =
    alg === "ES256K" ? ES256KSigner(privateKey) : EdDSASigner(privateKey)

  return {
    did,
    signer,
    alg
  }
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
