import { createVerifiablePresentationJwt } from "did-jwt-vc"
import { v4 as uuidv4 } from "uuid"
import {
  DescriptorMap,
  DidKey,
  PresentationDefinition,
  EncodedVerificationSubmission,
  VerifiableCredential
} from "../types"
import { verifiablePresentationPayload } from "./credentials"
import { didKeyToIssuer } from "./didKey"

export async function createVerificationSubmission(
  didKey: DidKey,
  presentationDefinition: PresentationDefinition,
  verifiedCredential: VerifiableCredential | VerifiableCredential[]
): Promise<EncodedVerificationSubmission> {
  const client = didKeyToIssuer(didKey)

  const presentationSubmission = {
    id: uuidv4(),
    definition_id: presentationDefinition.id,
    descriptor_map: presentationDefinition.input_descriptors.map((d) => {
      return {
        id: d.id,
        format: "jwt_vc",
        path: `$.presentation.verifiableCredential[0]`
      }
    }) as DescriptorMap[]
  }

  const payload = verifiablePresentationPayload(client.did, verifiedCredential)
  const vp = await createVerifiablePresentationJwt(payload, client)

  return {
    presentation_submission: presentationSubmission,
    presentation: vp
  }
}
