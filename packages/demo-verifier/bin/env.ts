import { randomDidKey } from "@verity/verity"
import { randomBytes } from "crypto"
import { Wallet } from "ethers"

async function setup(): Promise<void> {
  const issuerDidKey = await randomDidKey()
  const verifierDidKey = await randomDidKey()
  const jwtSecret = randomBytes(256).toString("base64")

  console.log(`NEXT_PUBLIC_ISSUER_DID=${issuerDidKey.subject}`)
  console.log(
    `NEXT_PUBLIC_ISSUER_SECRET=${Buffer.from(issuerDidKey.privateKey).toString(
      "hex"
    )}`
  )
  console.log(`VERIFIER_DID=${verifierDidKey.subject}`)
  console.log(
    `VERIFIER_PRIVATE_KEY=0x${Buffer.from(verifierDidKey.privateKey).toString(
      "hex"
    )}`
  )
  console.log(`JWT_SECRET=${jwtSecret}`)

  // Create a random address to represent the address of our smart contract
  const wallet = Wallet.createRandom()
  console.log(`CONTRACT_ADDRESS=${wallet.address}`)
}

setup()
  .then(() => {
    process.exit(0)
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
