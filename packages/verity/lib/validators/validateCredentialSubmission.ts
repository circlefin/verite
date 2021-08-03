import { CredentialManifest, EncodedCredentialApplication } from "../../types"
import { ValidationError } from "../errors"
import { hasPaths } from "../utils/has-paths"
import { ProcessedCredentialApplication } from "./ProcessedCredentialApplication"
import {
  messageToValidationFailure,
  processCredentialApplication
} from "./validators"

type FindManifestById = (id?: string) => Promise<CredentialManifest | undefined>

export async function validateCredentialSubmission(
  application: EncodedCredentialApplication,
  findManifestById: FindManifestById
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
  const manifest = await findManifestById(
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
