import type {
  EncodedVerificationSubmission,
  PresentationDefinition
} from "@centre/verity"
import { has } from "lodash"
import type { ProcessedVerificationSubmission } from "../../types"
import { ValidationError } from "../../types"
import {
  processVerificationSubmission,
  messageToValidationFailure
} from "../validators"
import { kycPresentationDefinition } from "./requests"

export const PRESENTATION_DEFINITIONS: PresentationDefinition[] = [
  kycPresentationDefinition
]

export function findPresentationDefinitionById(
  id: string
): PresentationDefinition | undefined {
  return PRESENTATION_DEFINITIONS.find((p) => p.id === id)
}

export async function validateVerificationSubmission(
  verificationSubmission: EncodedVerificationSubmission
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

  return processVerificationSubmission(
    verificationSubmission,
    presentationDefinition
  )
}

function hasPaths(obj: Record<string, unknown>, keys: string[]) {
  return keys.every((key) => has(obj, key))
}
