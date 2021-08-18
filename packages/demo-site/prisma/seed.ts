import { asyncMap } from "@centre/verity"
import { PrismaClient, User } from "@prisma/client"

const prisma = new PrismaClient()

type UserInput = Partial<User> & { email: string }
// Users
const users: UserInput[] = [
  {
    email: "alice@test.com",
    password: "testing",
    role: "admin",
    jumioScore: 80,
    ofacScore: 0,
    creditScore: 750
  },
  {
    email: "bob@test.com",
    password: "testing",
    role: "member",
    jumioScore: 10,
    ofacScore: 1,
    creditScore: 320
  },
  {
    email: "kim@test.com",
    password: "testing",
    role: "member",
    jumioScore: 81,
    ofacScore: 0,
    creditScore: 751
  },
  {
    email: "brice@test.com",
    password: "testing",
    role: "member",
    jumioScore: 82,
    ofacScore: 1,
    creditScore: 752
  },
  {
    email: "matt@test.com",
    password: "testing",
    role: "member",
    jumioScore: 10,
    ofacScore: 1,
    creditScore: 400
  },
  {
    email: "sean@test.com",
    password: "testing",
    role: "member",
    jumioScore: 100,
    ofacScore: 0,
    creditScore: 850
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
