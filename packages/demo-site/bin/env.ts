import { randomBytes } from "crypto"
import { randomDidKey } from "@centre/verity"
import internalIP from "internal-ip"

async function setup(): Promise<void> {
  const issuerDidKey = await randomDidKey()
  const verifierDidKey = await randomDidKey()
  const jwtSecret = randomBytes(256).toString("base64")

  console.log(`ISSUER_DID=${issuerDidKey.controller}`)
  console.log(
    `ISSUER_SECRET=${Buffer.from(issuerDidKey.privateKey).toString("hex")}`
  )
  console.log(`VERIFIER_DID=${verifierDidKey.controller}`)
  console.log(
    `VERIFIER_SECRET=${Buffer.from(verifierDidKey.privateKey).toString("hex")}`
  )
  console.log(`AUTH_JWT_SECRET=${jwtSecret}`)
  console.log(`HOSTNAME=${internalIP.v4.sync()}`)
}

setup()
  .then(() => {
    process.exit(0)
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
