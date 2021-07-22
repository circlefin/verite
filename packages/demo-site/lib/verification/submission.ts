import { PresentationDefinition, VerificationSubmission } from "@centre/verity"
import {
  tryAcceptVerificationSubmission,
  messageToVerificationFailure
} from "../validators"
import { kycVerificationRequest } from "./requests"
import {
  AcceptedVerificationSubmission,
  ValidationError,
  ValidationFailure
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
): Promise<AcceptedVerificationSubmission> {
  if (
    !hasPaths(verificationSubmission, [
      "presentation_submission",
      "presentation"
    ])
  ) {
    throw new ValidationError(
      "Missing required paths in Credential Application",
      messageToVerificationFailure(
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
      messageToVerificationFailure(
        "This issuer doesn't accept submissions associated with the presentation definition id"
      )
    )
  }

  const errors = new Array<ValidationFailure>()
  const verified = await tryAcceptVerificationSubmission(
    verificationSubmission,
    presentationDefinition,
    errors
  )
  if (errors.length > 0) {
    throw new ValidationError(
      "Unable to validate Credential Application",
      errors
    )
  }
  return verified
}

function hasPaths(application: Record<string, unknown>, keys: string[]) {
  return keys.some((key) => application[key] !== undefined)
}
