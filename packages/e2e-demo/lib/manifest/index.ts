import { creditScoreManifest } from "./creditScore"
import { kycManifest } from "./kyc"

import type { CredentialManifest } from "verite"

export const MANIFEST_MAP: Record<string, CredentialManifest> = {
  "credit-score": creditScoreManifest,
  kyc: kycManifest
}

export const MANIFESTS: CredentialManifest[] = Object.values(MANIFEST_MAP)

export async function findManifestById(
  id: string
): Promise<CredentialManifest | undefined> {
  return MANIFESTS.find((m) => m.id === id)
}
