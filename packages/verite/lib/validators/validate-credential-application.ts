import {
  CredentialManifest,
  DecodedCredentialApplicationWrapper
} from "../../types"
import { ValidationError } from "../errors"
import { hasPaths } from "../utils/has-paths"

/**
 * Fetches the manifest id from a credential application
 */
export function getManifestIdFromCredentialApplication(
  application: DecodedCredentialApplicationWrapper
): string {
  return application.credential_application.manifest_id
}

/**
 * Validate the format and contents of a Credential Application against the
 * associated Credential Manifest.
 *
 * @throws {ValidationError} If the credential application is invalid.
 */
export async function validateCredentialApplication(
  application: DecodedCredentialApplicationWrapper,
  manifest: CredentialManifest
): Promise<void> {
  if (getManifestIdFromCredentialApplication(application) !== manifest.id) {
    throw new ValidationError(
      "Invalid Manifest ID",
      "This application does not include a valid manifest id"
    )
  }

  // Ensure the application has the correct paths
  if (!hasPaths(application, ["credential_application"])) {
    throw new ValidationError(
      "Missing required paths in Credential Application",
      "Input doesn't have the required format for a Credential Application"
    )
  }
}
