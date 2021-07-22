import {
  AcceptedCredentialApplication,
  CredentialApplication,
  verifyCredentialApplication,
  VerificationError
} from "@centre/verity"
import { findManifestById } from "./manifest"

export async function validateCredentialSubmission(
  application: CredentialApplication
): Promise<AcceptedCredentialApplication> {
  if (
    !hasPaths(application, [
      "credential_application",
      "presentation_submission",
      "presentation"
    ])
  ) {
    throw new VerificationError(
      "Missing required paths in Credential Application"
    )
  }

  /**
   * Ensure there is a valid manifest with this manifest_id
   */
  const manifest = findManifestById(
    application.credential_application.manifest_id
  )
  if (!manifest) {
    throw new VerificationError("Invalid Manifest ID")
  }

  const errors = []
  const accepted = await verifyCredentialApplication(application, manifest, errors)
  if (errors.length > 0) {
    throw new VerificationError("Submission was invalid", errors)
  }
  return accepted
}

function hasPaths(application: Record<string, unknown>, keys: string[]) {
  return keys.some((key) => application[key] !== undefined)
}
