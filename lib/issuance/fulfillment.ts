import { Issuer } from "did-jwt-vc"
import { User } from "lib/database"
import {
  AcceptedCredentialApplication,
  createFullfillment,
  CredentialApplication,
  CredentialFulfillment,
  kycAmlVerifiableCredentialPayload,
  Verified
} from "lib/verity"

export async function createKycAmlFulfillment(
  user: User,
  issuer: Issuer,
  acceptedApplication: AcceptedCredentialApplication
): Promise<CredentialFulfillment> {
  const verifiablePresentation =
    acceptedApplication.verified.verifiablePresentation

  return createFullfillment(
    issuer,
    acceptedApplication,
    kycAmlVerifiableCredentialPayload(verifiablePresentation.holder, {
      authorityId: "did:web:circle.com",
      approvalDate: new Date().toJSON(),
      authorityName: "Circle",
      authorityUrl: "https://circle.com",
      authorityCallbackUrl: "https://identity.circle.com",
      serviceProviders: [
        {
          name: "Jumio",
          score: user.jumioScore
        },
        {
          name: "OFAC-SDN",
          score: user.ofacScore
        }
      ]
    })
  )
}
