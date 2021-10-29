import { PrismaClient } from "@prisma/client"
export type {
  Credential,
  History,
  PendingReceive,
  PendingSend,
  RevocationList,
  User,
  VerificationRequest
} from "@prisma/client"

export let prisma: PrismaClient

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient()
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient()
  }
  prisma = global.prisma
}
