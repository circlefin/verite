import { Issuer } from "did-jwt-vc"
import { User } from "lib/database"
import {
  createFullfillment,
  CredentialApplication,
  CredentialFulfillment,
  CreditScore,
  creditScoreVerifiableCredentialPayload,
  decodeVerifiablePresentation,
  KYCAMLAttestation,
  kycAmlVerifiableCredentialPayload
} from "lib/verity"

export async function createKycAmlFulfillment(
  user: User,
  issuer: Issuer,
  application: CredentialApplication
): Promise<CredentialFulfillment> {
  const { verifiablePresentation } = await decodeVerifiablePresentation(
    application.presentation
  )

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
    application,
    kycAmlVerifiableCredentialPayload(verifiablePresentation.holder, body)
  )
}

export async function createCreditScoreFulfillment(
  user: User,
  issuer: Issuer,
  application: CredentialApplication
): Promise<CredentialFulfillment> {
  const { verifiablePresentation } = await decodeVerifiablePresentation(
    application.presentation
  )

  const body: CreditScore = {
    "@type": "CreditScore",
    score: user.creditScore,
    scoreType: "Credit Rating",
    provider: "Experian"
  }

  return createFullfillment(
    issuer,
    application,
    creditScoreVerifiableCredentialPayload(verifiablePresentation.holder, body)
  )
}

export async function createFulfillment(
  user: User,
  issuer: Issuer,
  application: CredentialApplication
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
