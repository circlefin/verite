import { createVerifiableCredentialJwt } from "did-jwt-vc"
import { JWT } from "did-jwt-vc/lib/types"
import uuid from "react-native-uuid"

import { DescriptorMap } from "../../../types/shared/DescriptorMap"
import { asyncMap } from "../async-fns"
import {
  vcPayloadApplication,
  didKeyToIssuer,
  CredentialManifest,
  DidKey
} from "../verity"

export async function createCredentialApplication(
  didKey: DidKey,
  manifest: CredentialManifest
): Promise<any> {
  const client = didKeyToIssuer(didKey)

  // create credential_submission block
  const credentialSubmission = {
    id: uuid.v4(),
    manifest_id: manifest.id,
    format: {
      jwt_vp: manifest.presentation_definition.format.jwt_vp
    }
  }

  const presentationSubmission = {
    id: uuid.v4(),
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

  const credentials: JWT[] = (await asyncMap(
    manifest.presentation_definition.input_descriptors,
    async _d => {
      const payload = vcPayloadApplication(client)
      return createVerifiableCredentialJwt(payload, client)
    }
  )) as JWT[]

  return {
    credential_submission: credentialSubmission,
    presentation_submission: presentationSubmission,
    verifiableCredential: credentials
  }
}
