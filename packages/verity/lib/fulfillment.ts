import { v4 as uuidv4 } from "uuid"
import {
  DescriptorMap,
  EncodedCredentialFulfillment,
  GenericCredentialApplication,
  JwtCredentialPayload,
  JWT
} from "../types"
import { asyncMap } from "./async-fns"
import { CredentialSigner } from "./credential-signer"
import { verifiablePresentationPayload } from "./credentials"

export async function createFullfillment(
  credentialSigner: CredentialSigner,
  application: GenericCredentialApplication,
  credentials: JwtCredentialPayload | JwtCredentialPayload[]
): Promise<EncodedCredentialFulfillment> {
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
      return credentialSigner.signVerifiableCredential(credential)
    }
  )) as JWT[]

  const presentation = await credentialSigner.signVerifiablePresentation(
    verifiablePresentationPayload(
      credentialSigner.signingConfig.did,
      jwtCredentials
    )
  )

  return {
    credential_fulfillment: credentialFullfillment,
    presentation
  }
}
