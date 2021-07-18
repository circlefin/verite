import { createVerifiablePresentationJwt } from "did-jwt-vc"
import { verifiablePresentationPayload } from "./credentials"
import { didKeyToIssuer } from "./didKey"
import { createVerificationSubmission } from "./submission"
import {
  VerificationSubmission,
  DidKey,
  JWT,
  PresentationDefinition
} from "./types"

export async function createPresentationSubmission(
  didKey: DidKey,
  presentationDefinition: PresentationDefinition,
  vcJwt: JWT | JWT[]
): Promise<VerificationSubmission> {
  const client = didKeyToIssuer(didKey)

  const presentationSubmission = createVerificationSubmission(
    presentationDefinition.id,
    presentationDefinition.input_descriptors
  )

  const payload = verifiablePresentationPayload(client, vcJwt)
  const vp = await createVerifiablePresentationJwt(payload, client)

  return {
    presentation_submission: presentationSubmission,
    presentation: vp
  }
}
