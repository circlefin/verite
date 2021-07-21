import {
  AcceptedCredentialApplication,
  CredentialApplication,
  decodeVerifiablePresentation,
  VerificationError
} from "@centre/verity"
import { findManifestById } from "./manifest"

export async function validateCredentialSubmission(
  application: CredentialApplication
): Promise<AcceptedCredentialApplication> {
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
    throw new VerificationError("Invalid JSON format")
  }

  /**
   * Ensure there is a valid manfiest with this manifest_id
   */
  const manifest = findManifestById(
    application.credential_application.manifest_id
  )
  if (!manifest) {
    throw new VerificationError("Invalid Manifest ID")
  }

  /**
   * Decode VP, performing VP verification
   */
  const verified = await decodeVerifiablePresentation(application.presentation)
  /**
   * TODO: Validate input meets manifest requirements
   */

  return {
    ...application,
    verified: verified
  }
}

function hasPaths(application: Record<string, unknown>, keys: string[]) {
  return keys.some((key) => application[key] !== undefined)
}
