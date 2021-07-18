import { createVerifiablePresentationJwt } from "did-jwt-vc"
import { v4 as uuidv4 } from "uuid"
import { verifiablePresentationPayload } from "./credentials"
import { didKeyToIssuer } from "./didKey"
import { createVPSubmission } from "./submission"
import { CredentialApplication, CredentialManifest, DidKey } from "./types"

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

  const presentationSubmission = createVPSubmission(
    manifest.presentation_definition.id,
    manifest.presentation_definition.input_descriptors
  )

  const payload = verifiablePresentationPayload(client)
  const vp = await createVerifiablePresentationJwt(payload, client)

  return {
    credential_application: credentialApplication,
    presentation_submission: presentationSubmission,
    presentation: vp
  }
}
