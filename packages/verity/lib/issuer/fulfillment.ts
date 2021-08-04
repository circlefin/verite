import { v4 as uuidv4 } from "uuid"
import type {
  DescriptorMap,
  EncodedCredentialFulfillment,
  GenericCredentialApplication,
  Issuer,
  JwtCredentialPayload,
  JWT
} from "../../types"
import { asyncMap, verifiablePresentationPayload } from "../utils"
import {
  signVerifiableCredential,
  signVerifiablePresentation
} from "../utils/sign-fns"

export async function generateFulfillment(
  signer: Issuer,
  application: GenericCredentialApplication,
  credentials: JwtCredentialPayload | JwtCredentialPayload[]
): Promise<EncodedCredentialFulfillment> {
  const credentialFulfillment = {
    id: uuidv4(),
    manifest_id: application.credential_application.manifest_id,
    descriptor_map:
      application.presentation_submission?.descriptor_map?.map<DescriptorMap>(
        (d, i) => {
          return {
            id: d.id,
            format: "jwt_vc",
            path: `$.presentation.credential[${i}]`
          }
        }
      ) || []
  }

  const jwtCredentials: JWT[] = await asyncMap<JwtCredentialPayload, JWT>(
    [credentials].flat(),
    (credential) => {
      return signVerifiableCredential(signer, credential)
    }
  )

  const presentation = await signVerifiablePresentation(
    signer,
    verifiablePresentationPayload(signer.did, jwtCredentials)
  )

  return {
    credential_fulfillment: credentialFulfillment,
    presentation
  }
}
