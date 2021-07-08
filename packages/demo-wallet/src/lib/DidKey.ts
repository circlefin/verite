import crypto from "crypto"
import * as ed25519 from "@stablelib/ed25519"
import Multibase from "multibase"
import Multicodec from "multicodec"

export const generate = ({
  secureRandom
}: {
  secureRandom: () => Uint8Array
}) => {
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

export const random = () => {
  const secureRandom = () => new Uint8Array(crypto.randomBytes(32))
  return generate({ secureRandom })
}
