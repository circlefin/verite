import {
  createVerifiableCredentialJwt,
  createVerifiablePresentationJwt,
  Issuer
} from "did-jwt-vc"
import { JWT } from "did-jwt-vc/lib/types"
import { v4 as uuidv4 } from "uuid"
import { asyncMap } from "lib/async-fns"
import { decodeVp, vcPayloadKYCFulfillment, vpPayload } from "lib/credentials"
import { CredentialFulfillmentResponse } from "types"
import {
  CredentialApplication,
  CredentialApplicationPresentation
} from "types/presentation_submission/PresentationSubmission"
import { DescriptorMap } from "types/shared/DescriptorMap"

export async function createFullfillment(
  issuer: Issuer,
  application: CredentialApplication
): Promise<CredentialFulfillmentResponse> {
  const credentialFullfillment = {
    id: uuidv4(),
    manifest_id: application.credential_submission.manifest_id,
    descriptor_map: application.presentation_submission.descriptor_map.map(
      (d, i) => {
        return {
          id: d.id,
          format: "jwt_vc",
          path: `$.presentation.credential[${i}]`
        }
      }
    ) as DescriptorMap[]
  }

  const { verifiablePresentation } = await decodeVp(application.presentation)

  const credentials: JWT[] = (await asyncMap(
    application.presentation_submission.descriptor_map,
    async (d, i) => {
      const subject =
        verifiablePresentation.verifiableCredential[i].credentialSubject.id

      const payload = vcPayloadKYCFulfillment(subject, {
        authorityId: "did:web:circle.com",
        approvalDate: "2020-06-01T14:00:00",
        expirationDate: "2021-06-01T13:59:59",
        authorityName: "Circle",
        authorityUrl: "https://circle.com",
        authorityCallbackUrl: "https://identity.circle.com",
        serviceProviders: [
          {
            name: "Jumio",
            score: 80
          },
          {
            name: "OFAC-SDN",
            score: 0
          }
        ]
      })

      return createVerifiableCredentialJwt(payload, issuer)
    }
  )) as JWT[]

  const vp = await createVerifiablePresentationJwt(
    vpPayload(credentials),
    issuer
  )

  return {
    credential_fulfillment: credentialFullfillment,
    presentation: vp
  }
}
