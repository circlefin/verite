import { asyncMap } from "@centre/verity"
import { PrismaClient, User } from "@prisma/client"
import { Wallet } from "ethers"

const prisma = new PrismaClient()

type UserInput = Partial<User> & {
  email: string
  mnemonic: string
  address: string
}
// Users
const aliceWallet = Wallet.createRandom()
const bobWallet = Wallet.createRandom()
const kimWallet = Wallet.createRandom()
const briceWallet = Wallet.createRandom()
const mattWallet = Wallet.createRandom()
const seanWallet = Wallet.createRandom()

const users: UserInput[] = [
  {
    email: "alice@test.com",
    password: "testing",
    role: "admin",
    jumioScore: 80,
    ofacScore: 0,
    creditScore: 750,
    mnemonic: aliceWallet.mnemonic.phrase,
    address: aliceWallet.address
  },
  {
    email: "bob@test.com",
    password: "testing",
    role: "member",
    jumioScore: 10,
    ofacScore: 1,
    creditScore: 320,
    mnemonic: bobWallet.mnemonic.phrase,
    address: bobWallet.address
  },
  {
    email: "kim@test.com",
    password: "testing",
    role: "member",
    jumioScore: 81,
    ofacScore: 0,
    creditScore: 751,
    mnemonic: kimWallet.mnemonic.phrase,
    address: kimWallet.address
  },
  {
    email: "brice@test.com",
    password: "testing",
    role: "member",
    jumioScore: 82,
    ofacScore: 1,
    creditScore: 752,
    mnemonic: briceWallet.mnemonic.phrase,
    address: briceWallet.address
  },
  {
    email: "matt@test.com",
    password: "testing",
    role: "member",
    jumioScore: 10,
    ofacScore: 1,
    creditScore: 400,
    mnemonic: mattWallet.mnemonic.phrase,
    address: mattWallet.address
  },
  {
    email: "sean@test.com",
    password: "testing",
    role: "member",
    jumioScore: 100,
    ofacScore: 0,
    creditScore: 850,
    mnemonic: seanWallet.mnemonic.phrase,
    address: seanWallet.address
  }
]

async function main() {
  await asyncMap(users, async (user) => {
    console.info(`Creating user ${user.email}...`)
    return prisma.user.create({
      data: user
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
