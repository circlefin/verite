import {
  CREDIT_SCORE_ATTESTATION_MANIFEST_ID,
  KYCAML_ATTESTATION_MANIFEST_ID,
  kycAmlAttestation,
  CredentialManifest,
  creditScoreAttestation
} from "@centre/verity"
import type { CreditScoreAttestation, KYCAMLAttestation } from "@centre/verity"
import type { User } from "../database"

export function buildAttestationForUser(
  user: User,
  manifest: CredentialManifest
): KYCAMLAttestation | CreditScoreAttestation {
  if (manifest.id === KYCAML_ATTESTATION_MANIFEST_ID) {
    return kycAmlAttestation([
      {
        "@type": "KYCAMLProvider",
        name: "Jumio",
        score: user.jumioScore
      },
      {
        "@type": "KYCAMLProvider",
        name: "OFAC-SDN",
        score: user.ofacScore
      }
    ])
  } else if (manifest.id === CREDIT_SCORE_ATTESTATION_MANIFEST_ID) {
    return creditScoreAttestation(user.creditScore)
  }
}
