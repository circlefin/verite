import {
  createVerifiableCredentialJwt,
  createVerifiablePresentationJwt,
  Issuer,
  JwtCredentialPayload
} from "did-jwt-vc"
import { v4 as uuidv4 } from "uuid"
import { verifiablePresentationPayload } from "./credentials"
import {
  CredentialApplication,
  CredentialFulfillment,
  DescriptorMap,
  JWT
} from "./types"
import { asyncMap } from "lib/async-fns"

export async function createFullfillment(
  issuer: Issuer,
  application: CredentialApplication,
  credentials: JwtCredentialPayload | JwtCredentialPayload[]
): Promise<CredentialFulfillment> {
  const credentialFullfillment = {
    id: uuidv4(),
    manifest_id: application.credential_application.manifest_id,
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

  const jwtCredentials: JWT[] = (await asyncMap(
    [credentials].flat(),
    (credential) => {
      return createVerifiableCredentialJwt(credential, issuer)
    }
  )) as JWT[]

  const presentation = await createVerifiablePresentationJwt(
    verifiablePresentationPayload(issuer, jwtCredentials),
    issuer
  )

  return {
    credential_fulfillment: credentialFullfillment,
    presentation
  }
}
