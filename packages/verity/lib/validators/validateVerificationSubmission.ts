import {
  EncodedVerificationSubmission,
  PresentationDefinition
} from "../../types"
import { ValidationError } from "../errors"
import { hasPaths } from "../utils/has-paths"
import { ProcessedVerificationSubmission } from "./ProcessedVerificationSubmission"
import {
  messageToValidationFailure,
  processVerificationSubmission
} from "./validators"

type FindPresentationDefinitionById = (
  id?: string
) => Promise<PresentationDefinition | undefined>

export async function validateVerificationSubmission(
  verificationSubmission: EncodedVerificationSubmission,
  findPresentationDefinitionById: FindPresentationDefinitionById
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
  const presentationDefinition = await findPresentationDefinitionById(
    verificationSubmission.presentation_submission?.definition_id
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
