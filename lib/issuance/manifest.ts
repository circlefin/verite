import { creditScoreManifest } from "./manifests/creditScore"
import { kycManifest } from "./manifests/kyc"
import { CredentialManifest } from "lib/verity"

export const MANIFEST_MAP: Record<string, CredentialManifest> = {
  "credit-score": creditScoreManifest,
  kyc: kycManifest
}

export const MANIFESTS: CredentialManifest[] = Object.values(MANIFEST_MAP)

export function findManifestById(id: string): CredentialManifest | undefined {
  return MANIFESTS.find((m) => m.id === id)
}
