import {
  CREDIT_SCORE_ATTESTATION_MANIFEST_ID,
  KYCAML_ATTESTATION_MANIFEST_ID,
  CredentialManifest
} from "verite"

import type { User } from "../database"
import type { CreditScoreAttestation, KYCAMLAttestation } from "verite"

export function buildAttestationForUser(
  user: User,
  manifest: CredentialManifest
): KYCAMLAttestation | CreditScoreAttestation {
  if (manifest.id === KYCAML_ATTESTATION_MANIFEST_ID) {
    return {
      type: "KYCAMLAttestation",
      process: "https://demos.verite.id/schemas/definitions/1.0.0/kycaml/usa",
      approvalDate: new Date().toJSON()
    } as KYCAMLAttestation
  } else if (manifest.id === CREDIT_SCORE_ATTESTATION_MANIFEST_ID) {
    return {
      type: "CreditScoreAttestation",
      score: user.creditScore,
      scoreType: "Credit Score",
      provider: "Experian"
    } as CreditScoreAttestation
  }
}
