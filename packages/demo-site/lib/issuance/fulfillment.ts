import {
  CREDIT_SCORE_ATTESTATION_MANIFEST_ID,
  generateFulfillment,
  KYCAML_ATTESTATION_MANIFEST_ID,
  creditScoreVerifiableCredentialPayload,
  kycAmlVerifiableCredentialPayload
} from "@centre/verity"
import type {
  CreditScore,
  KYCAMLAttestation,
  RevocationList2021Status,
  EncodedCredentialFulfillment,
  Issuer
} from "@centre/verity"
import type { ProcessedCredentialApplication } from "@centre/verity"
import type { User } from "../database"

export async function createKycAmlFulfillment(
  user: User,
  signer: Issuer,
  acceptedApplication: ProcessedCredentialApplication,
  credentialStatus: RevocationList2021Status
): Promise<EncodedCredentialFulfillment> {
  const verifiablePresentation = acceptedApplication.presentation

  const body: KYCAMLAttestation = {
    "@type": "KYCAMLAttestation",
    authorityId: "did:web:verity.id",
    approvalDate: new Date().toJSON(),
    authorityName: "Verity",
    authorityUrl: "https://verity.id",
    authorityCallbackUrl: "https://identity.verity.id",
    serviceProviders: [
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
    ]
  }

  return generateFulfillment(
    signer,
    acceptedApplication,
    kycAmlVerifiableCredentialPayload(
      verifiablePresentation.holder,
      body,
      credentialStatus
    )
  )
}

export async function createCreditScoreFulfillment(
  user: User,
  signer: Issuer,
  acceptedApplication: ProcessedCredentialApplication,
  credentialStatus: RevocationList2021Status
): Promise<EncodedCredentialFulfillment> {
  const verifiablePresentation = acceptedApplication.presentation

  const body: CreditScore = {
    "@type": "CreditScore",
    score: user.creditScore,
    scoreType: "Credit Rating",
    provider: "Experian"
  }

  return generateFulfillment(
    signer,
    acceptedApplication,
    creditScoreVerifiableCredentialPayload(
      verifiablePresentation.holder,
      body,
      credentialStatus
    )
  )
}

export async function createFulfillment(
  user: User,
  signer: Issuer,
  application: ProcessedCredentialApplication,
  credentialStatus: RevocationList2021Status
): Promise<EncodedCredentialFulfillment | undefined> {
  switch (application.credential_application.manifest_id) {
    case KYCAML_ATTESTATION_MANIFEST_ID:
      return createKycAmlFulfillment(
        user,
        signer,
        application,
        credentialStatus
      )
    case CREDIT_SCORE_ATTESTATION_MANIFEST_ID:
      return createCreditScoreFulfillment(
        user,
        signer,
        application,
        credentialStatus
      )
  }
}
