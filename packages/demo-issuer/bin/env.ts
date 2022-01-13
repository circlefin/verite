import { randomBytes } from "crypto"
import { randomDidKey } from "verite"

async function setup(): Promise<void> {
  const issuerDidKey = randomDidKey()
  const jwtSecret = randomBytes(256).toString("base64")

  console.log(`NEXT_PUBLIC_ISSUER_DID=${issuerDidKey.subject}`)
  console.log(
    `NEXT_PUBLIC_ISSUER_SECRET=${Buffer.from(issuerDidKey.privateKey).toString(
      "hex"
    )}`
  )
  console.log(`NEXT_PUBLIC_JWT_SECRET=${jwtSecret}`)
}

setup()
  .then(() => {
    process.exit(0)
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
