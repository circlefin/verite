import { Issuer } from "did-jwt-vc"
import { User } from "lib/database"
import {
  AcceptedCredentialApplication,
  createFullfillment,
  CredentialFulfillment,
  CreditScore,
  creditScoreVerifiableCredentialPayload,
  KYCAMLAttestation,
  kycAmlVerifiableCredentialPayload
} from "lib/verity"

export async function createKycAmlFulfillment(
  user: User,
  issuer: Issuer,
  acceptedApplication: AcceptedCredentialApplication
): Promise<CredentialFulfillment> {
  const verifiablePresentation =
    acceptedApplication.verified.verifiablePresentation

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

  return createFullfillment(
    issuer,
    acceptedApplication,
    kycAmlVerifiableCredentialPayload(verifiablePresentation.holder, body)
  )
}

export async function createCreditScoreFulfillment(
  user: User,
  issuer: Issuer,
  acceptedApplication: AcceptedCredentialApplication
): Promise<CredentialFulfillment> {
  const verifiablePresentation =
    acceptedApplication.verified.verifiablePresentation

  const body: CreditScore = {
    "@type": "CreditScore",
    score: user.creditScore,
    scoreType: "Credit Rating",
    provider: "Experian"
  }

  return createFullfillment(
    issuer,
    acceptedApplication,
    creditScoreVerifiableCredentialPayload(verifiablePresentation.holder, body)
  )
}

export async function createFulfillment(
  user: User,
  issuer: Issuer,
  application: AcceptedCredentialApplication
): Promise<CredentialFulfillment> {
  switch (application.credential_application.manifest_id) {
    case "KYCAMLAttestation":
      return createKycAmlFulfillment(user, issuer, application)
    case "CreditScoreAttestation":
      return createCreditScoreFulfillment(user, issuer, application)
    default:
      return null
  }
}
