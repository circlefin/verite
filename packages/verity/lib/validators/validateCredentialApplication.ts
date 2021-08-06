import { DecodedCredentialApplication } from "../../types"
import { ValidationError } from "../errors"
import { hasPaths } from "../utils/has-paths"

/**
 * Validate the format and contents of a Credential Application against the
 * associated Credential Manifest.
 *
 * @throws {ValidationError} If the credential application is invalid.
 */
export function validateCredentialApplication(
  application: DecodedCredentialApplication
): void {
  if (
    !hasPaths(application, [
      "credential_application",
      "presentation_submission",
      "presentation"
    ])
  ) {
    throw new ValidationError(
      "Missing required paths in Credential Application",
      "Input doesn't have the required format for a Credential Application"
    )
  }
}
