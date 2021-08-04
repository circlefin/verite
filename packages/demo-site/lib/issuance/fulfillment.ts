import {
  buildAndSignKycAmlFulfillment,
  buildAndSignCreditScoreFulfillment,
  CREDIT_SCORE_ATTESTATION_MANIFEST_ID,
  KYCAML_ATTESTATION_MANIFEST_ID,
  kycAmlAttestation
} from "@centre/verity"
import type {
  CreditScore,
  EncodedCredentialFulfillment,
  Issuer,
  KYCAMLAttestation,
  ProcessedCredentialApplication,
  RevocationList2021Status
} from "@centre/verity"
import type { User } from "../database"

function kycAmlServiceProvidersForUser(user: User): KYCAMLAttestation {
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
}

function creditScoreForUser(user: User): CreditScore {
  return {
    "@type": "CreditScore",
    score: user.creditScore,
    scoreType: "Credit Rating",
    provider: "Experian"
  }
}

export async function buildAndSignFulfillmentForUser(
  user: User,
  signer: Issuer,
  application: ProcessedCredentialApplication,
  credentialStatus: RevocationList2021Status
): Promise<EncodedCredentialFulfillment | undefined> {
  switch (application.credential_application.manifest_id) {
    case KYCAML_ATTESTATION_MANIFEST_ID:
      return buildAndSignKycAmlFulfillment(
        signer,
        application,
        credentialStatus,
        kycAmlServiceProvidersForUser(user)
      )
    case CREDIT_SCORE_ATTESTATION_MANIFEST_ID:
      return buildAndSignCreditScoreFulfillment(
        signer,
        application,
        credentialStatus,
        creditScoreForUser(user)
      )
  }
}
