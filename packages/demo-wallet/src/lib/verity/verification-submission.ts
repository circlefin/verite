import { createVerifiablePresentationJwt } from "did-jwt-vc"
import { v4 as uuidv4 } from "uuid"
import { verifiablePresentationPayload } from "./credentials"
import { didKeyToIssuer } from "./didKey"
import {
  DescriptorMap,
  DidKey,
  JWT,
  PresentationDefinition,
  VerificationSubmission
} from "./types"

export async function createPresentationSubmission(
  didKey: DidKey,
  presentationDefinition: PresentationDefinition,
  vcJwt: JWT | JWT[]
): Promise<VerificationSubmission> {
  const client = didKeyToIssuer(didKey)

  const presentationSubmission = {
    id: uuidv4(),
    definition_id: presentationDefinition.id,
    descriptor_map: presentationDefinition.input_descriptors.map(d => {
      return {
        id: d.id,
        format: "jwt_vc",
        path: `$.presentation.verifiableCredential[0]`
      }
    }) as DescriptorMap[]
  }

  const payload = verifiablePresentationPayload(client, vcJwt)
  const vp = await createVerifiablePresentationJwt(payload, client)

  return {
    presentation_submission: presentationSubmission,
    presentation: vp
  }
}
