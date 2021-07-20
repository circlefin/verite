import jwt from "jsonwebtoken"
import { random } from "lodash"
import { JWT } from "next-auth/jwt"
import { v4 as uuidv4 } from "uuid"

const JWT_ALGORITHM = "HS256"
const JWT_EXPIRES_IN = "1h"

export type User = {
  id: string
  email: string
  password: string
  jumioScore?: number
  ofacScore?: number
  creditScore?: number
}

export const USERS: User[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    email: "alice@test.com",
    password: "testing",
    jumioScore: 80,
    ofacScore: 0,
    creditScore: 750
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    email: "bob@test.com",
    password: "testing",
    jumioScore: 10,
    ofacScore: 1,
    creditScore: 320
  }
]

export function createUser(email: string, opts: Partial<User> = {}): User {
  const id = uuidv4()
  const password = opts.password || "testing"
  const jumioScore = opts.jumioScore || random(0, 100)
  const ofacScore = opts.ofacScore || random(0, 100)
  const creditScore = opts.creditScore || random(0, 100)

  const user = { id, email, password, jumioScore, ofacScore, creditScore }

  USERS.push(user)
  return user
}

export function findUser(id: string): User | undefined {
  return USERS.find((u) => u.id === id)
}

export function authenticateUser(
  email: string,
  password: string
): User | undefined {
  return USERS.find((u) => u.email === email && u.password === password)
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

    return findUser(payload.sub)
  } catch (e) {
    // JSON Web Token is invalid
    return
  }
}
