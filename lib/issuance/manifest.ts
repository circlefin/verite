import jwt from "jsonwebtoken"
import { findUser, User } from "lib/database"

const JWT_ALGORITHM = "HS256"
const JWT_EXPIRES_IN = "1h"

export const inssuanceManifestToken = async (user: User): Promise<string> => {
  return jwt.sign({}, process.env.JWT_SECRET, {
    subject: user.id,
    algorithm: JWT_ALGORITHM,
    expiresIn: JWT_EXPIRES_IN
  })
}

export const findUserFromManfiestToken = async (
  token: string
): Promise<User | undefined> => {
  try {
    const payload = await jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: [JWT_ALGORITHM]
    })

    return findUser(payload.sub)
  } catch (e) {
    // JSON Web Token is invalid
    return
  }
}
