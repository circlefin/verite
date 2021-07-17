import { JwtCredentialPayload } from "did-jwt-vc"
import { v4 as uuidv4 } from "uuid"
import { CredentialSigner } from "./credential-signer"
import { verifiablePresentationPayload } from "./credentials"
import {
  CredentialApplication,
  CredentialFulfillment,
  DescriptorMap,
  JWT
} from "./types"
import { asyncMap } from "lib/verity/async-fns"

export async function createFullfillment(
  credentialSigner: CredentialSigner,
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
