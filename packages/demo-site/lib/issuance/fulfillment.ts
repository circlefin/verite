import type {
  CreditScore,
  KYCAMLAttestation,
  RevocationList2021Status,
  EncodedCredentialFulfillment
} from "@centre/verity"
import {
  CREDIT_SCORE_ATTESTATION_MANIFEST_ID,
  generateFulfillment,
  KYCAML_ATTESTATION_MANIFEST_ID,
  creditScoreVerifiableCredentialPayload,
  kycAmlVerifiableCredentialPayload,
  CredentialSigner
} from "@centre/verity"
import type { ProcessedCredentialApplication } from "../../types"
import type { User } from "../database"

export async function createKycAmlFulfillment(
  user: User,
  credentialSigner: CredentialSigner,
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
    credentialSigner,
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
  credentialSigner: CredentialSigner,
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
    credentialSigner,
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
  credentialSigner: CredentialSigner,
  application: ProcessedCredentialApplication,
  credentialStatus: RevocationList2021Status
): Promise<EncodedCredentialFulfillment | undefined> {
  switch (application.credential_application.manifest_id) {
    case KYCAML_ATTESTATION_MANIFEST_ID:
      return createKycAmlFulfillment(
        user,
        credentialSigner,
        application,
        credentialStatus
      )
    case CREDIT_SCORE_ATTESTATION_MANIFEST_ID:
      return createCreditScoreFulfillment(
        user,
        credentialSigner,
        application,
        credentialStatus
      )
  }
}
