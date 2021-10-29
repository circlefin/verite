import { PrismaClient, User } from "@prisma/client"
import { asyncMap } from "@verity/core"
import { Wallet } from "ethers"

const prisma = new PrismaClient()

type UserInput = Partial<User> & {
  email: string
}

const USERS: UserInput[] = [
  { email: "alice@test.com", fullName: "Alice Test" },
  { email: "bob@test.com", fullName: "Bob Test" },
  { email: "kim@test.com", fullName: "Kim Test" },
  { email: "sean@test.com", fullName: "Sean Test" },
  { email: "brice@test.com", fullName: "Brice Test" },
  { email: "matt@test.com", fullName: "Matt Test" }
]

async function main() {
  await asyncMap(USERS, async (user) => {
    console.info(`Creating user ${user.email}...`)

    const wallet = Wallet.createRandom()
    const data = Object.assign(
      {},
      {
        creditScore: 750,
        address: wallet.address,
        privateKey: wallet.privateKey
      },
      user
    ) as UserInput

    return prisma.user.create({
      data
    })
  })
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
