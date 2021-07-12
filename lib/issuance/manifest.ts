import jwt from "jsonwebtoken"
import { findUser, User } from "lib/database"
import { CredentialIssuer, generateKycAmlManifest } from "lib/verity"

import { CredentialManifest } from "types"

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

export const circleIssuer: CredentialIssuer = {
  id: "did:web:circle.com",
  comment: "JSON-LD definition at https://circle.com/.well_known/did.json",
  name: "Circle",
  styles: {}
}

export const kycManifest: CredentialManifest = generateKycAmlManifest(
  circleIssuer,
  {
    thumbnail: {
      uri: "https://circle.com/img/logo.png",
      alt: "Circle Logo"
    },
    hero: {
      uri: "https://circle.com/img/kycCred.png",
      alt: "KYC Visual"
    },
    background: {
      color: "#ff0000"
    },
    text: {
      color: "#d4d400"
    }
  }
)

export const MANIFEST_MAP: Record<string, CredentialManifest> = {
  kyc: kycManifest
}

export const MANIFESTS: CredentialManifest[] = Object.values(MANIFEST_MAP)

export function findManifestById(id: string): CredentialManifest | undefined {
  return MANIFESTS.find((m) => m.id === id)
}
