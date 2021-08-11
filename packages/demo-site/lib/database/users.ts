import { JWT } from "@centre/verity"
import jwt from "jsonwebtoken"
import { prisma, User } from "./prisma"

const JWT_ALGORITHM = "HS256"
const JWT_EXPIRES_IN = "1h"

export async function allUsers(): Promise<User[]> {
  return prisma.user.findMany({
    orderBy: {
      email: "asc"
    }
  })
}

export async function findUser(id?: string): Promise<User | undefined> {
  if (!id) {
    return
  }

  return prisma.user.findUnique({
    where: { id }
  })
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<User | undefined> {
  return prisma.user.findFirst({
    where: { email, password }
  })
}

export async function temporaryAuthToken(
  user: User,
  ttl: string = JWT_EXPIRES_IN
): Promise<JWT> {
  return jwt.sign({}, process.env.AUTH_JWT_SECRET, {
    subject: user.id,
    algorithm: JWT_ALGORITHM,
    expiresIn: ttl
  })
}

export const findUserFromTemporaryAuthToken = async (
  token: string
): Promise<User | undefined> => {
  try {
    const payload = await jwt.verify(token, process.env.AUTH_JWT_SECRET, {
      algorithms: [JWT_ALGORITHM]
    })

    return findUser(payload.sub as string)
  } catch (e) {
    // JSON Web Token is invalid
    return
  }
}
