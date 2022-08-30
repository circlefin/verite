import { CredentialManifest, DecodedCredentialApplication } from "../../types"
import { ValidationError } from "../errors"
import { getManifestIdFromCredentialApplication } from "../issuer/credential-application"
import { hasPaths } from "../utils/has-paths"

/**
 * Validate the format and contents of a Credential Application against the
 * associated Credential Manifest.
 *
 * @throws {ValidationError} If the credential application is invalid.
 */
export async function validateCredentialApplication(
  application: DecodedCredentialApplication,
  manifest?: CredentialManifest
): Promise<void> {
  if (!manifest) {
    throw new ValidationError(
      "Invalid Manifest ID",
      "This issuer doesn't issue credentials for the specified Manifest ID"
    )
  }

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
