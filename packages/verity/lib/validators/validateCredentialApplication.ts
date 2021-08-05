import { CredentialManifest, EncodedCredentialApplication } from "../../types"
import { ValidationError } from "../errors"
import { hasPaths } from "../utils/has-paths"
import { ProcessedCredentialApplication } from "./ProcessedCredentialApplication"
import {
  messageToValidationFailure,
  processCredentialApplication
} from "./validators"

/**
 * Validate the format and contents of a Credential Application against the
 * associated Credential Manifest.
 */
export async function validateCredentialApplication(
  application: EncodedCredentialApplication,
  manifest?: CredentialManifest
): Promise<ProcessedCredentialApplication> {
  if (!manifest) {
    throw new ValidationError(
      "Invalid Manifest ID",
      messageToValidationFailure(
        "This issuer doesn't issue credentials for the specified Manifest ID"
      )
    )
  }

  // Ensure the application has the correct paths
  if (
    !hasPaths(application, [
      "credential_application",
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

  const processed = await processCredentialApplication(application, manifest)

  return processed
}
