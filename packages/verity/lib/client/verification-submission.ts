import { createVerifiablePresentationJwt } from "did-jwt-vc"
import { v4 as uuidv4 } from "uuid"
import type {
  DescriptorMap,
  DidKey,
  PresentationDefinition,
  EncodedVerificationSubmission,
  Verifiable,
  W3CCredential
} from "../../types"
import { didKeyToIssuer, verifiablePresentationPayload } from "../utils"

export async function createVerificationSubmission(
  didKey: DidKey,
  presentationDefinition: PresentationDefinition,
  verifiedCredential: Verifiable<W3CCredential> | Verifiable<W3CCredential>[]
): Promise<EncodedVerificationSubmission> {
  const client = didKeyToIssuer(didKey)

  const presentationSubmission = {
    id: uuidv4(),
    definition_id: presentationDefinition.id,
    descriptor_map: presentationDefinition.input_descriptors.map<DescriptorMap>(
      (d) => {
        return {
          id: d.id,
          format: "jwt_vc",
          path: `$.presentation.verifiableCredential[0]`
        }
      }
    )
  }

  const payload = verifiablePresentationPayload(client.did, verifiedCredential)
  const vp = await createVerifiablePresentationJwt(payload, client)

  return {
    presentation_submission: presentationSubmission,
    presentation: vp
  }
}
