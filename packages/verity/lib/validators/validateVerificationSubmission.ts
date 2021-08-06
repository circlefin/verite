import {
  EncodedVerificationSubmission,
  PresentationDefinition
} from "../../types"
import { ValidationError } from "../errors"
import { hasPaths } from "../utils/has-paths"
import { ProcessedVerificationSubmission } from "./ProcessedVerificationSubmission"
import { processVerificationSubmission } from "./validators"

export async function validateVerificationSubmission(
  verificationSubmission: EncodedVerificationSubmission,
  presentationDefinition?: PresentationDefinition
): Promise<ProcessedVerificationSubmission> {
  /**
   * Ensure there is a valid presentation definition
   */
  if (!presentationDefinition) {
    throw new ValidationError(
      "Invalid Presentation Definition ID",
      "This issuer doesn't accept submissions associated with the presentation definition id"
    )
  }

  if (
    !hasPaths(verificationSubmission, [
      "presentation_submission",
      "presentation"
    ])
  ) {
    throw new ValidationError(
      "Missing required paths in Credential Application",
      "Input doesn't have the required format for a Credential Application"
    )
  }

  return processVerificationSubmission(
    verificationSubmission,
    presentationDefinition
  )
}
