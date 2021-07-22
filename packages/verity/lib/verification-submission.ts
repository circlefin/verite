import {
  createVerifiablePresentationJwt,
  Verifiable,
  W3CCredential
} from "did-jwt-vc"
import { v4 as uuidv4 } from "uuid"
import {
  DescriptorMap,
  DidKey,
  JWT,
  PresentationDefinition,
  VerificationSubmission
} from "../types"
import { verifiablePresentationPayload } from "./credentials"
import { didKeyToIssuer } from "./didKey"

type CredentialType =
  | JWT
  | JWT[]
  | Verifiable<W3CCredential>
  | Verifiable<W3CCredential>[]

export async function createVerificationSubmission(
  didKey: DidKey,
  presentationDefinition: PresentationDefinition,
  verifiableCredential: CredentialType
): Promise<VerificationSubmission> {
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

  const payload = verifiablePresentationPayload(client, verifiableCredential)
  const vp = await createVerifiablePresentationJwt(payload, client)

  return {
    presentation_submission: presentationSubmission,
    presentation: vp
  }
}
