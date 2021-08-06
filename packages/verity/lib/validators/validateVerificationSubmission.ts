import {
  DecodedVerificationSubmission,
  PresentationDefinition,
  RevocableCredential,
  Verifiable,
  W3CPresentation
} from "../../types"
import { ValidationError } from "../errors"
import { isRevoked } from "../issuer/revocation"
import { asyncSome } from "../utils/async-fns"
import { hasPaths } from "../utils/has-paths"
import { validatePresentationSubmission } from "./validators"

export async function validateVerificationSubmission(
  verificationSubmission: DecodedVerificationSubmission,
  presentationDefinition?: PresentationDefinition
): Promise<void> {
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

  await ensureNotRevoked(verificationSubmission.presentation)

  validatePresentationSubmission(verificationSubmission, presentationDefinition)
}

async function ensureNotRevoked(
  presentation: Verifiable<W3CPresentation>
): Promise<void> {
  const credentials =
    (presentation.verifiableCredential as RevocableCredential[]) || []

  const anyRevoked = await asyncSome(credentials, async (credential) => {
    return isRevoked(credential)
  })

  if (anyRevoked) {
    throw new ValidationError(
      "Revoked Credentials",
      "At least one of the provided verified credential have been revoked"
    )
  }
}
