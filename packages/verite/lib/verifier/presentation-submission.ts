import {
  DecodedPresentationSubmission,
  DidKey,
  EncodedPresentationSubmission,
  LatestPresentationPayload,
  PresentationDefinition,
  Verifiable,
  W3CCredential
} from "../../types"
import { PresentationPayloadBuilder } from "../builders"
import {
  buildIssuer,
  signVerifiablePresentation,
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
    | JWT[]
): LatestPresentationPayload {
  const presentationPayload = new PresentationPayloadBuilder()
    .verifiableCredential(verifiableCredential)
    .withPresentationSubmission((b) =>
      b.initFromPresentationDefinition(presentationDefinition)
    )
    .build()

  return presentationPayload
}

export async function composePresentationSubmission(
  didKey: DidKey,
  presentationDefinition: PresentationDefinition,
  verifiableCredential:
    | Verifiable<W3CCredential>
    | Verifiable<W3CCredential>[]
    | JWT
    | JWT[],
  options?: VerifyPresentationOptions
): Promise<JWT> {
  const submission = buildPresentationSubmission(
    presentationDefinition,
    verifiableCredential
  )

  // TOFIX: does this need to be exposed as alias too?
  const client = buildIssuer(didKey.subject, didKey.privateKey)
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
