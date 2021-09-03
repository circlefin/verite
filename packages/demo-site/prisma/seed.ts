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
const aliceWallet = Wallet.fromMnemonic(
  "doctor card season nasty dose refuse arrest enroll lock rely nerve reject"
)
const bobWallet = Wallet.fromMnemonic(
  "feed flame cable lock kind jar diet security auction kitten question stand"
)
const kimWallet = Wallet.fromMnemonic(
  "alcohol talk chronic mistake invest tumble horse pattern monster inner ivory awesome"
)
const briceWallet = Wallet.fromMnemonic(
  "chase scrub final fossil onion enter imitate enable amused salad predict trigger"
)
const mattWallet = Wallet.fromMnemonic(
  "hard laptop lucky green conduct maze gravity state welcome stomach camera grunt"
)
const seanWallet = Wallet.fromMnemonic(
  "milk power apple shallow spatial speak infant bind split spice brief wave"
)

const users: UserInput[] = [
  {
    email: "alice@test.com",
    password: "testing",
    creditScore: 750,
    mnemonic: aliceWallet.mnemonic.phrase,
    address: aliceWallet.address
  },
  {
    email: "bob@test.com",
    password: "testing",
    creditScore: 320,
    mnemonic: bobWallet.mnemonic.phrase,
    address: bobWallet.address
  },
  {
    email: "kim@test.com",
    password: "testing",
    creditScore: 751,
    mnemonic: kimWallet.mnemonic.phrase,
    address: kimWallet.address
  },
  {
    email: "brice@test.com",
    password: "testing",
    creditScore: 752,
    mnemonic: briceWallet.mnemonic.phrase,
    address: briceWallet.address
  },
  {
    email: "matt@test.com",
    password: "testing",
    creditScore: 400,
    mnemonic: mattWallet.mnemonic.phrase,
    address: mattWallet.address
  },
  {
    email: "sean@test.com",
    password: "testing",
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
