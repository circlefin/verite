import { JWT } from "did-jwt-vc/lib/types"
import { v4 as uuidv4 } from "uuid"
import { findManifestById } from "./manifest"
import { asyncMap } from "lib/async-fns"
import { createVerifiablePresentationJwt } from 'lib/sign-utils'
import {
  vcPayloadApplication,
  vpPayloadApplication,
  didKeyToIssuer,
  CredentialManifest,
  DidKey
} from "lib/verity"
import { CredentialApplication } from "types/presentation_submission/PresentationSubmission"
import { DescriptorMap } from "types/shared/DescriptorMap"




export async function createCredentialApplication(
  didKey: DidKey,
  manifest: CredentialManifest
): Promise<any> {
  const client = didKeyToIssuer(didKey)

  // create credential_application block
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
      (d, i) => {
        return {
          id: d.id,
          format: "jwt_vp",
          path: `$.presentation[${i}]`
        }
      }
    ) as DescriptorMap[]
  }

  // TODO: come back to this
  /*
  const credentials: JWT[] = (await asyncMap(
    manifest.presentation_definition.input_descriptors,
    async (d) => {
      const payload = vpPayloadApplication(client)
      return createVerifiablePresentationJwt(payload, client)
    }
  )) as JWT[]*/

  const payload = vpPayloadApplication(client)
  const vp = await createVerifiablePresentationJwt(payload, client)

  return {
    credential_application: credentialApplication,
    presentation_submission: presentationSubmission,
    presentation: vp
  }
}

export function validateCredentialSubmission(
  application: CredentialApplication
): void {
  /**
   * Validate the format
   *
   * TODO(mv): Use did-jwt validators?
   */
  if (
    !hasPaths(application, [
      "credential_application",
      "presentation_submission",
      "presentation"
    ])
  ) {
    throw new Error("Invalid JSON format")
  }

  /**
   * Ensure there is a valid manfiest with this manifest_id
   */
  const manifest = findManifestById(
    application.credential_application.manifest_id
  )
  if (!manifest) {
    throw new Error("Invalid Manifest ID")
  }

  /**
   * Validate the proof
   */
}

function hasPaths(application: Record<string, unknown>, keys: string[]) {
  return keys.some((key) => application[key] !== undefined)
}
