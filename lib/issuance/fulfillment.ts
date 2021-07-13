import { Issuer } from "did-jwt-vc"
import { User } from "lib/database"
import {
  createFullfillment,
  CredentialApplication,
  CredentialFulfillment,
  decodeVp,
  kycAmlVerifiableCredentialPayload
} from "lib/verity"

export async function createKycAmlFulfillment(
  user: User,
  issuer: Issuer,
  application: CredentialApplication
): Promise<CredentialFulfillment> {
  const { verifiablePresentation } = await decodeVp(application.presentation)

  return createFullfillment(
    issuer,
    application,
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
