import {
  CREDIT_SCORE_ATTESTATION_MANIFEST_ID,
  KYCAML_ATTESTATION_MANIFEST_ID,
  CredentialManifest,
  Attestation,
  getSampleKycAmlAttestation,
  getSampleCreditScoreAttestation
} from "verite"

import type { User } from "../database"

export function buildAttestationForUser(
  user: User,
  manifest: CredentialManifest
): Attestation {
  if (manifest.id === KYCAML_ATTESTATION_MANIFEST_ID) {
    return getSampleKycAmlAttestation()
  } else if (manifest.id === CREDIT_SCORE_ATTESTATION_MANIFEST_ID) {
    return getSampleCreditScoreAttestation(user.creditScore)
  }
}

