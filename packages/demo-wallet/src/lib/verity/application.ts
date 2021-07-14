import { v4 as uuidv4 } from "uuid"
import { createVerifiablePresentationJwt } from "../did-jwt-vc"
import { verifiablePresentationPayload } from "./credentials"
import { didKeyToIssuer } from "./didKey"
import {
  CredentialApplication,
  CredentialManifest,
  DescriptorMap,
  DidKey
} from "./types"

export async function createCredentialApplication(
  didKey: DidKey,
  manifest: CredentialManifest
): Promise<CredentialApplication> {
  const client = didKeyToIssuer(didKey)

  const credentialApplication = {
    id: uuidv4(),
    manifest_id: manifest.id,
    format: {
      jwt_vp: manifest.presentation_definition.format.jwt_vp
    }
  }

  const presentationSubmission = {
    id: uuidv4(),
    definition_id: manifest.presentation_definition.id,
    descriptor_map: manifest.presentation_definition.input_descriptors.map(
      d => {
        return {
          id: d.id,
          format: "jwt_vp",
          path: `$.presentation`
        }
      }
    ) as DescriptorMap[]
  }

  const payload = verifiablePresentationPayload(client)
  const vp = await createVerifiablePresentationJwt(payload, client)

  return {
    credential_application: credentialApplication,
    presentation_submission: presentationSubmission,
    presentation: vp
  }
}
