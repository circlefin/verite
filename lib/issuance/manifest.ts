import jwt from "jsonwebtoken"
import { findUser, User } from "lib/database"
import {
  CredentialIssuer,
  CredentialManifest,
  createKycAmlManifest
} from "lib/verity"

export const circleIssuer: CredentialIssuer = {
  id: "did:web:circle.com",
  comment: "JSON-LD definition at https://circle.com/.well_known/did.json",
  name: "Circle",
  styles: {}
}

export const kycManifest: CredentialManifest = createKycAmlManifest(
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
