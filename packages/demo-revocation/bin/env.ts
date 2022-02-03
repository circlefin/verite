import { randomBytes } from "crypto"
import { randomDidKey } from "verite"

async function setup(): Promise<void> {
  const issuerDidKey = randomDidKey(randomBytes)

  console.log(`NEXT_PUBLIC_ISSUER_DID=${issuerDidKey.subject}`)
  console.log(
    `NEXT_PUBLIC_ISSUER_SECRET=${Buffer.from(issuerDidKey.privateKey).toString(
      "hex"
    )}`
  )
}

setup()
  .then(() => {
    process.exit(0)
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
