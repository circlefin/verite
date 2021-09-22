import { CreatePresentationOptions } from "did-jwt-vc/lib/types"
import { v4 as uuidv4 } from "uuid"
import type {
  EncodedCredentialApplication,
  CredentialManifest,
  DescriptorMap,
  DidKey
} from "../../types"
import { didKeyToIssuer, encodeVerifiablePresentation } from "../utils"

/**
 * Generates a Credential Application as response to a Credential Manifest
 *
 * @returns an encoded & signed application that can be submitted to the issuer
 */
export async function createCredentialApplication(
  didKey: DidKey,
  manifest: CredentialManifest,
  options?: CreatePresentationOptions
): Promise<EncodedCredentialApplication> {
  const client = didKeyToIssuer(didKey)

  const credentialApplication = {
    id: uuidv4(),
    manifest_id: manifest.id,
    format: {
      jwt_vp: manifest.presentation_definition?.format?.jwt_vp
    }
  }

  let presentationSubmission
  if (manifest.presentation_definition) {
    presentationSubmission = {
      id: uuidv4(),
      definition_id: manifest.presentation_definition?.id,
      descriptor_map:
        manifest.presentation_definition?.input_descriptors?.map<DescriptorMap>(
          (d) => {
            return {
              id: d.id,
              format: "jwt_vp",
              path: `$.presentation`
            }
          }
        )
    }
  }

  const vp = await encodeVerifiablePresentation(
    client.did,
    undefined,
    client,
    options
  )

  return {
    credential_application: credentialApplication,
    presentation_submission: presentationSubmission,
    presentation: vp
  }
}