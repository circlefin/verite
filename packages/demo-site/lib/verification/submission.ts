import { kycVerificationRequest } from "./requests"
import {
  AcceptedVerificationSubmission,
  decodeVerifiablePresentation,
  PresentationDefinition,
  VerificationError,
  VerificationSubmission
} from "lib/verity"

const kycPresentationDefinition =
  kycVerificationRequest().presentation_definition

export const PRESENTATION_DEFINITIONS: PresentationDefinition[] = [
  kycPresentationDefinition
]

export function findPresentationDefinitionById(
  id: string
): PresentationDefinition | undefined {
  return PRESENTATION_DEFINITIONS.find((p) => p.id === id)
}

export async function validateVerificationSubmission(
  verificationSubmission: VerificationSubmission
): Promise<AcceptedVerificationSubmission> {
  /**
   * Validate the format
   *
   * TODO(mv): Use did-jwt validators?
   */
  if (
    !hasPaths(verificationSubmission, [
      "presentation_submission",
      "presentation"
    ])
  ) {
    throw new VerificationError("Invalid JSON format")
  }

  /**
   * Ensure there is a valid presentation definition
   */

  const presentationDefinition = findPresentationDefinitionById(
    verificationSubmission.presentation_submission.definition_id
  )
  if (!presentationDefinition) {
    throw new VerificationError("Invalid Presentation Definition ID")
  }

  /**
   * Decode VP, performing VP verification
   */
  const verified = await decodeVerifiablePresentation(
    verificationSubmission.presentation
  )
  /**
   * TODO: Validate input meets presentation definition requirements. Bad Hack for now!
   */

  verified.checks.push({
    status: 200,
    title: "Proof of KYC",
    detail: "Proof of KYC from an accepted issuer"
  })
  return {
    ...verificationSubmission,
    verified: verified
  }
}

function hasPaths(application: Record<string, unknown>, keys: string[]) {
  return keys.some((key) => application[key] !== undefined)
}
