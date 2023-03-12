import { v4 as uuidv4 } from "uuid"

import {
  ClaimFormat,
  DecodedPresentationSubmission,
  DescriptorMap,
  DidKey,
  EncodedPresentationSubmission,
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
  VERIFIABLE_PRESENTATION_TYPE_NAME,
  verifyVerifiablePresentation
} from "../utils"
import { validatePresentationSubmission } from "../validators"

import type { JWT, VerifyPresentationOptions } from "did-jwt-vc/src/types"

type ValidateVerificationSubmissionOptions = VerifyPresentationOptions & {
  knownSchemas?: Record<string, Record<string, unknown>>
}

// TOFIX: need new type for this union?
export function buildPresentationSubmission(
  presentationDefinition: PresentationDefinition,
  verifiableCredential:
    | Verifiable<W3CCredential>
    | Verifiable<W3CCredential>[]
    | JWT
    | JWT[],
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

export async function composePresentationSubmission(
  didKey: DidKey,
  presentationDefinition: PresentationDefinition,
  verifiableCredential:
    | Verifiable<W3CCredential>
    | Verifiable<W3CCredential>[]
    | Verifiable<W3CCredential>
    | Verifiable<W3CCredential>[]
    | JWT
    | JWT[],
  options?: VerifyPresentationOptions
): Promise<JWT> {
  const client = buildIssuer(didKey.subject, didKey.privateKey)
  const submission = buildPresentationSubmission(
    presentationDefinition,
    verifiableCredential
  )

  // TOFIX: does this need to be exposed as alias too?
  const vp = await signVerifiablePresentation(submission, client, options)

  return vp
}

/**
 * Decode an encoded Presentation Submission.
 *
 * A Presentation Submission is a Verifiable Presentation. This method decodes
 * the submitted Presentation Submission, verifies it as a Verifiable
 * Presentation, and returns the decoded Presentation Submission.
 *
 * @returns the decoded Presentation Submission
 * @throws VerificationException if the Presentation Submission is not a valid Verifiable Presentation
 */
export async function decodePresentationSubmission(
  encodedSubmission: EncodedPresentationSubmission,
  options?: ValidateVerificationSubmissionOptions
): Promise<DecodedPresentationSubmission> {
  const presentation = await verifyVerifiablePresentation(
    encodedSubmission,
    options
  )
  return presentation
}

/**
 * Decode and validate an encoded Presentation Submission.
 *
 * This is a convenience wrapper around `decodePresentationSubmission` and `validatePresentationSubmission`,`,
 * which can be called separately.
 *
 * @returns the decoded Presentation Submission
 * @throws VerificationException if the PresentationSubmission is not a valid
 *  Verifiable Presentation
 * @throws ValidationException if the Presentation Submission does not match the requirements
 */
export async function evaluatePresentationSubmission(
  encodedSubmission: EncodedPresentationSubmission,
  presentationDefinition: PresentationDefinition,
  options?: ValidateVerificationSubmissionOptions
): Promise<DecodedPresentationSubmission> {
  const decodedSubmission = await decodePresentationSubmission(
    encodedSubmission,
    options
  )
  await validatePresentationSubmission(
    decodedSubmission,
    presentationDefinition
  )
  return decodedSubmission
}
