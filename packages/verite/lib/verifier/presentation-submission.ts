import { v4 as uuidv4 } from "uuid"

import {
  ClaimFormat,
  DescriptorMap,
  DidKey,
  JwtPresentationPayload,
  PresentationDefinition,
  Verifiable,
  W3CCredential
} from "../../types"
import {
  PresentationPayloadBuilder,
  PresentationSubmissionBuilder
} from "../builders"
import {
  buildIssuer,
  signVerifiablePresentation,
  PRESENTAION_SUBMISSION_TYPE_NAME,
  VERIFIABLE_PRESENTATION_TYPE_NAME
} from "../utils"

import type { JWT, VerifyPresentationOptions } from "did-jwt-vc/src/types"

export function buildSubmission(
  presentationDefinition: PresentationDefinition,
  verifiableCredential: Verifiable<W3CCredential> | Verifiable<W3CCredential>[],
  presentationType: string | string[] = [
    VERIFIABLE_PRESENTATION_TYPE_NAME,
    PRESENTAION_SUBMISSION_TYPE_NAME
  ]
): JwtPresentationPayload {
  const submission = new PresentationSubmissionBuilder()
    .id(uuidv4())
    .definition_id(presentationDefinition.id)
    .descriptor_map(
      presentationDefinition.input_descriptors.map<DescriptorMap>((d, i) => {
        return {
          id: d.id,
          format: ClaimFormat.JwtVc,
          path: `$.verifiableCredential[${i}]`
        }
      })
    )
    .build()

  const presentationPayload = new PresentationPayloadBuilder()
    .type(presentationType)
    .verifiableCredential(verifiableCredential)
    .presentation_submission(submission)
    .build()

  const payload = Object.assign({
    vp: {
      ...presentationPayload
    }
  })

  return payload
}

export async function buildPresentationSubmission(
  didKey: DidKey,
  presentationDefinition: PresentationDefinition,
  verifiableCredential: Verifiable<W3CCredential> | Verifiable<W3CCredential>[],
  options?: VerifyPresentationOptions
): Promise<JWT> {
  const client = buildIssuer(didKey.subject, didKey.privateKey)
  const submission = buildSubmission(
    presentationDefinition,
    verifiableCredential
  )

  const vp = await signVerifiablePresentation(submission, client, options)

  return vp
}
