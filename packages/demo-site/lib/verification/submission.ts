import { PresentationDefinition, VerificationSubmission } from "@centre/verity"
import {
  processVerificationSubmission,
  messageToValidationFailure
} from "../validators"
import { kycVerificationRequest } from "./requests"
import {
  ProcessedVerificationSubmission,
  ValidationError
} from "types"

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
): Promise<ProcessedVerificationSubmission> {
  if (
    !hasPaths(verificationSubmission, [
      "presentation_submission",
      "presentation"
    ])
  ) {
    throw new ValidationError(
      "Missing required paths in Credential Application",
      messageToValidationFailure(
        "Input doesn't have the required format for a Credential Application"
      )
    )
  }

  /**
   * Ensure there is a valid presentation definition
   */
  const presentationDefinition = findPresentationDefinitionById(
    verificationSubmission.presentation_submission.definition_id
  )
  if (!presentationDefinition) {
    throw new ValidationError(
      "Invalid Presentation Definition ID",
      messageToValidationFailure(
        "This issuer doesn't accept submissions associated with the presentation definition id"
      )
    )
  }

  const processed = await processVerificationSubmission(
    verificationSubmission,
    presentationDefinition,
  )
  return processed
}

function hasPaths(application: Record<string, unknown>, keys: string[]) {
  return keys.some((key) => application[key] !== undefined)
}
