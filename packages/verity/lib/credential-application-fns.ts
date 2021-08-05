import { createVerifiablePresentationJwt } from "did-jwt-vc"
import { v4 as uuidv4 } from "uuid"
import type {
  EncodedCredentialApplication,
  CredentialManifest,
  DescriptorMap,
  DidKey,
  GenericCredentialApplication
} from "../types"
import { didKeyToIssuer, verifiablePresentationPayload } from "./utils"

/**
 * Fetches the manifest id from a credential application
 */
export function getManifestIdFromCredentialApplication(
  application: GenericCredentialApplication
): string {
  return application.credential_application.manifest_id
}

/**
 * Generates a Credential Application as response to a Credential Manifest
 *
 * @returns an encoded & signed application that can be submitted to the issuer
 */
export async function createCredentialApplication(
  didKey: DidKey,
  manifest: CredentialManifest
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

  const payload = verifiablePresentationPayload(client.did)
  const vp = await createVerifiablePresentationJwt(payload, client)

  return {
    credential_application: credentialApplication,
    presentation_submission: presentationSubmission,
    presentation: vp
  }
}
