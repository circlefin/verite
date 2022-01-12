import { randomBytes } from "crypto"
import { randomDidKey } from "verite"

async function setup(): Promise<void> {
  const issuerDidKey = await randomDidKey()
  const verifierDidKey = await randomDidKey()
  const jwtSecret = randomBytes(256).toString("base64")

  console.log(`ISSUER_DID=${issuerDidKey.subject}`)
  console.log(
    `ISSUER_SECRET=${Buffer.from(issuerDidKey.privateKey).toString("hex")}`
  )
  console.log(`VERIFIER_DID=${verifierDidKey.subject}`)
  console.log(
    `VERIFIER_SECRET=${Buffer.from(verifierDidKey.privateKey).toString("hex")}`
  )
  console.log(`AUTH_JWT_SECRET=${jwtSecret}`)
}

setup()
  .then(() => {
    process.exit(0)
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
