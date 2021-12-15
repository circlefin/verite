import {
  CREDIT_SCORE_ATTESTATION_MANIFEST_ID,
  KYCAML_ATTESTATION_MANIFEST_ID,
  CredentialManifest
} from "@verity/core"
import type { CreditScoreAttestation, KYCAMLAttestation } from "@verity/core"
import type { User } from "../database"

export function buildAttestationForUser(
  user: User,
  manifest: CredentialManifest
): KYCAMLAttestation | CreditScoreAttestation {
  if (manifest.id === KYCAML_ATTESTATION_MANIFEST_ID) {
    return {
      "@type": "KYCAMLAttestation",
      process: "https://demos.verity.id/schemas/definitions/1.0.0/kycaml/usa",
      approvalDate: new Date().toJSON(),
      authorityId: "did:web:demos.verity.id",
      authorityName: "Verity",
      authorityUrl: "https://verity.id",
      authorityCallbackUrl: "https://identity.verity.id"
    } as KYCAMLAttestation
  } else if (manifest.id === CREDIT_SCORE_ATTESTATION_MANIFEST_ID) {
    return {
      "@type": "CreditScoreAttestation",
      score: user.creditScore,
      scoreType: "Credit Score",
      provider: "Experian"
    } as CreditScoreAttestation
  }
}
