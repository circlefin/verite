import { PrismaClient } from "@prisma/client"
export type {
  Credential,
  RevocationList,
  User,
  VerificationRequest,
  VerificationResult
} from "@prisma/client"

export const prisma = new PrismaClient()
