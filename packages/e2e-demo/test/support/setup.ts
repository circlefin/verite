import { prisma } from "../../lib/database/prisma"

afterAll(async () => {
  await prisma.$disconnect()
})
