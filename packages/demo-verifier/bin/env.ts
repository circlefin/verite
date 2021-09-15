import { randomBytes } from "crypto"
import { randomDidKey } from "@centre/verity"

async function setup(): Promise<void> {
  const issuerDidKey = await randomDidKey()
  const verifierDidKey = await randomDidKey()
  const jwtSecret = randomBytes(256).toString("base64")

  console.log(`NEXT_PUBLIC_ISSUER_DID=${issuerDidKey.controller}`)
  console.log(
    `NEXT_PUBLIC_ISSUER_SECRET=${Buffer.from(issuerDidKey.privateKey).toString(
      "hex"
    )}`
  )
  console.log(`VERIFIER_DID=${verifierDidKey.controller}`)
  console.log(
    `VERIFIER_PRIVATE_KEY=0x${Buffer.from(verifierDidKey.privateKey).toString(
      "hex"
    )}`
  )
  console.log(`JWT_SECRET=${jwtSecret}`)
}

setup()
  .then(() => {
    process.exit(0)
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
