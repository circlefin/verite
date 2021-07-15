import { Issuer } from "did-jwt-vc"
import { User } from "lib/database"
import {
  createFullfillment,
  CredentialApplication,
  CredentialFulfillment,
  decodeVerifiablePresentation,
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

  return createFullfillment(
    issuer,
    application,
    kycAmlVerifiableCredentialPayload(verifiablePresentation.holder, {
      authorityId: "did:web:verity.id",
      approvalDate: new Date().toJSON(),
      authorityName: "Verity",
      authorityUrl: "https://verity.id",
      authorityCallbackUrl: "https://identity.verity.id",
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
