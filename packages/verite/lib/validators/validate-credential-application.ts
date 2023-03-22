import {
  CredentialApplicationWrapper,
  CredentialManifest,
  JWT,
  MaybeCredential,
  Verifiable,
  W3CCredential
} from "../../types"
import { ValidationError } from "../errors"
import { decodeAndVerifyJwtCredentials } from "../utils"
import { hasPaths } from "../utils/has-paths"

/**
 * Validates the Credential Application for the given Credential Manifest.
 * @param application
 * @param manifest
 * @returns
 */
export async function validateCredentialApplicationForManifest(
  application: CredentialApplicationWrapper<MaybeCredential>,
  manifest: CredentialManifest
): Promise<CredentialApplicationWrapper<Verifiable<W3CCredential>>> {
  // top-level Credential Application validation
  await validateCredentialApplicationShallow(application, manifest)

  // decode and verify the Credential Application's verifiable credentials
  // if present
  const decoded = await decodeAndVerifyApplicationCredentials(application)

  // FOLLOW_UP: next is where we would check that the credentials
  // match the manifest's Presentation Definition (if present)
  // As of now, Verite samples don't include Credential Manifests
  // with credential input requirements.
  return decoded
}

/**
 * Validate the format and top-level contents of a Credential Application against the
 * associated Credential Manifest.
 *
 * @throws {ValidationError} If the credential application is invalid.
 */
export async function validateCredentialApplicationShallow(
  application: CredentialApplicationWrapper<MaybeCredential>,
  manifest: CredentialManifest
): Promise<void> {
  // Ensure the application has the correct paths
  if (!hasPaths(application, ["credential_application"])) {
    throw new ValidationError(
      "Missing required paths in Credential Application",
      "Input doesn't have the required format for a Credential Application"
    )
  }

  if (
    !hasPaths(application.credential_application, [
      "id",
      "spec_version",
      "manifest_id",
      "format",
      "applicant"
    ])
  ) {
    throw new ValidationError(
      "Missing required paths in Credential Application",
      "Input doesn't have the required format for a Credential Application"
    )
  }

  if (getManifestIdFromCredentialApplication(application) !== manifest.id) {
    throw new ValidationError(
      "Invalid Manifest ID",
      "This application does not match the expected manifest id"
    )
  }
}

async function decodeAndVerifyApplicationCredentials(
  application: CredentialApplicationWrapper<MaybeCredential>
): Promise<CredentialApplicationWrapper<Verifiable<W3CCredential>>> {
  let decodedArray: Verifiable<W3CCredential>[] | undefined
  if (application.verifiableCredential) {
    // FOLLOW_UP: when we support formats other than JWT, we'll check the credential
    // manifest for the format and use the appropriate decoder
    decodedArray = await decodeAndVerifyJwtCredentials(
      application.verifiableCredential as JWT[]
    )
  }
  const applicationWithDecodedCredentials = {
    credential_application: application.credential_application,
    ...(decodedArray !== undefined && { verifiableCredential: decodedArray })
  }
  return applicationWithDecodedCredentials
}

/**
 * Fetches the manifest id from a credential application
 */
export function getManifestIdFromCredentialApplication(
  application: CredentialApplicationWrapper<MaybeCredential>
): string {
  return application.credential_application.manifest_id
}
