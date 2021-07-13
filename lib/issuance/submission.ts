import { findManifestById } from "lib/issuance/manifest"
import { CredentialApplication } from "lib/verity"

export function validateCredentialSubmission(
  application: CredentialApplication
): void {
  /**
   * Validate the format
   *
   * TODO(mv): Use did-jwt validators?
   */
  if (
    !hasPaths(application, [
      "credential_application",
      "presentation_submission",
      "presentation"
    ])
  ) {
    throw new Error("Invalid JSON format")
  }

  /**
   * Ensure there is a valid manfiest with this manifest_id
   */
  const manifest = findManifestById(
    application.credential_application.manifest_id
  )
  if (!manifest) {
    throw new Error("Invalid Manifest ID")
  }

  /**
   * Validate the proof
   */
}

function hasPaths(application: Record<string, unknown>, keys: string[]) {
  return keys.some((key) => application[key] !== undefined)
}
