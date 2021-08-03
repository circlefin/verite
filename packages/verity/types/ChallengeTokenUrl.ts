import { CredentialManifest } from "./CredentialManifest"
import { VerificationRequest } from "./VerificationRequest"

/**
 * A Wrapper object to be used to as a QR Code payload pointing to
 * a manifest or a verifier.
 */
export type ChallengeTokenUrlWrapper = {
  challengeTokenUrl: string
  version: string
}

/**
 * A Wrapper containing a Credential Manifest and callback URL
 */
export type ManifestWrapper = {
  manifest: CredentialManifest
  callbackUrl: string
  purpose: string
  version: string
}

/**
 * A Wrapper containing a Verification Request
 */
export type VerificationRequestWrapper = {
  request: VerificationRequest
  purpose: string
  version: string
}
