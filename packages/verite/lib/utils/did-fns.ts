import * as ed25519 from "@stablelib/ed25519"
import { EdDSASigner, base64ToBytes, hexToBytes, base58ToBytes } from "did-jwt"
import { Resolver } from "did-resolver"
import { getResolver as getKeyResolver } from "key-did-resolver"
import { isString } from "lodash"
import Multibase from "multibase"
import Multicodec from "multicodec"
import { getResolver as getWebResolver } from "web-did-resolver"

import type { Signer, DidJwtIssuer, DidKey } from "../../types"

type RandomBytesMethod = (size: number) => Uint8Array

type GenerateDidKeyParams = {
  secureRandom: () => Uint8Array
}

const hexMatcher = /^(0x)?([a-fA-F0-9]{64}|[a-fA-F0-9]{128})$/
const base58Matcher = /^([1-9A-HJ-NP-Za-km-z]{44}|[1-9A-HJ-NP-Za-km-z]{88})$/
const base64Matcher = /^([0-9a-zA-Z=\-_+/]{43}|[0-9a-zA-Z=\-_+/]{86})(={0,2})$/

/**
 * Generate a `Signer` for a given a seed function.
 *
 * @returns a `Signer` object containing public and private keys.
 */
export function generateDidKey({ secureRandom }: GenerateDidKeyParams): DidKey {
  const key = ed25519.generateKeyPair({
    isAvailable: true,
    randomBytes: secureRandom
  })

  const methodSpecificId = toMethodSpecificId(key)

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
export function randomDidKey(randomBytes: RandomBytesMethod): DidKey {
  const secureRandom = () => new Uint8Array(randomBytes(32))
  return generateDidKey({ secureRandom })
}

export function parseKey(input: string | Uint8Array): Uint8Array {
  if (isString(input)) {
    if (hexMatcher.test(input)) {
      return hexToBytes(input)
    } else if (base58Matcher.test(input)) {
      return base58ToBytes(input)
    } else if (base64Matcher.test(input)) {
      return base64ToBytes(input)
    } else {
      throw TypeError("bad_key: Invalid private key format")
    }
  } else if (input instanceof Uint8Array) {
    return input
  } else {
    throw TypeError("bad_key: Invalid private key format")
  }
}

/**
 * Build an issuer from a did and private key
 */
function buildDidJwtIssuer(
  did: string,
  privateKey: string | Uint8Array
): DidJwtIssuer {
  return {
    did,
    signer: EdDSASigner(parseKey(privateKey)),
    alg: "EdDSA"
  }
}

/**
 * Build a signer from a did and private key
 */
export function buildSigner(
  did: string,
  privateKey: string | Uint8Array
): Signer {
  const secretKey = parseKey(privateKey)
  const publicKey = ed25519.extractPublicKeyFromSecretKey(secretKey)

  return {
    did,
    signerImpl: buildDidJwtIssuer(did, privateKey),
    keyId: toMethodSpecificId({ publicKey, secretKey })
  }
}

/**
 * Build a signer from a Signer
 */
export function buildSignerFromDidKey(didKey: DidKey): Signer {
  return buildSigner(didKey.controller, didKey.privateKey)
}

function toMethodSpecificId(key: ed25519.KeyPair) {
  return Buffer.from(
    Multibase.encode(
      "base58btc",
      Multicodec.addPrefix("ed25519-pub", Buffer.from(key.publicKey))
    )
  ).toString()
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
