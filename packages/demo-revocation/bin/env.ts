import { randomDidKey } from "@centre/verity"

async function setup(): Promise<void> {
  const issuerDidKey = randomDidKey()

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
