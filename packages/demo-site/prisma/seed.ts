import { asyncMap, buildIssuer, generateRevocationList } from "@centre/verity"
import { PrismaClient, User } from "@prisma/client"
import { Wallet } from "ethers"
import { v4 as uuidv4 } from "uuid"
import { saveRevocationList } from "../lib/database"

const prisma = new PrismaClient()

type UserInput = Partial<User> & { email: string; mnemonic: string }
// Users
const users: UserInput[] = [
  {
    email: "alice@test.com",
    password: "testing",
    role: "admin",
    jumioScore: 80,
    ofacScore: 0,
    creditScore: 750,
    mnemonic: Wallet.createRandom().mnemonic.phrase
  },
  {
    email: "bob@test.com",
    password: "testing",
    role: "member",
    jumioScore: 10,
    ofacScore: 1,
    creditScore: 320,
    mnemonic: Wallet.createRandom().mnemonic.phrase
  }
]

async function main() {
  await asyncMap(users, async (user) => {
    console.info(`Creating user ${user.email}...`)
    return prisma.user.create({
      data: user
    })
  })

  // Revocation List
  console.info(`Generating revocation lists ...`)
  await createRevocationList()
  await createRevocationList()
}

async function createRevocationList() {
  const url = `${process.env.HOST}/api/revocation/${uuidv4()}`
  const issuer = process.env.ISSUER_DID
  const list = await generateRevocationList(
    [],
    url,
    issuer,
    buildIssuer(process.env.ISSUER_DID, process.env.ISSUER_SECRET)
  )
  return saveRevocationList(list)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
