import { PrismaClient } from "@prisma/client"
export type {
  Credential,
  RevocationList,
  User,
  VerificationRequest
} from "@prisma/client"

export const prisma = new PrismaClient()
