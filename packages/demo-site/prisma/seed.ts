import { asyncMap } from "@centre/verity"
import { PrismaClient, User } from "@prisma/client"
const prisma = new PrismaClient()

type UserInput = Partial<User> & { email: string }

async function main() {
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
    }
  ]

  await asyncMap(users, async (user) => {
    console.log(`creating user ${user.email}...`)
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
  })
