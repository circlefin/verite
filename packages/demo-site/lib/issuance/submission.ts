import type {
  EncodedCredentialApplication,
  ProcessedCredentialApplication
} from "@centre/verity"
import {
  processCredentialApplication,
  messageToValidationFailure,
  ValidationError
} from "@centre/verity"
import { has } from "lodash"
import { findManifestById } from "./manifest"

export async function validateCredentialSubmission(
  application: EncodedCredentialApplication
): Promise<ProcessedCredentialApplication> {
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

  /**
   * Ensure there is a valid manifest with this manifest_id
   */
  const manifest = findManifestById(
    application.credential_application.manifest_id
  )
  if (!manifest) {
    throw new ValidationError(
      "Invalid Manifest ID",
      messageToValidationFailure(
        "This issuer doesn't issue credentials for the specified Manifest ID"
      )
    )
  }

  const processed = await processCredentialApplication(application, manifest)

  return processed
}

function hasPaths(obj: Record<string, unknown>, keys: string[]) {
  return keys.every((key) => has(obj, key))
}
