import { CredentialManifest } from "./CredentialManifest"
import { SubmissionRequest, VerificationRequest } from "./VerificationRequest"
import { VerificationInfoResponse } from "./VerificationResult"

/**
 * A Wrapper object to be used to as a QR Code payload pointing to
 * a manifest or a verifier.
 */
export type ChallengeTokenUrlWrapper = {
  challengeTokenUrl: string
}

export type ManifestWrapper = SubmissionRequest & {
  body: {
    manifest: CredentialManifest
  }
}

export type VerificationRequestWrapper = {
  request: VerificationRequest
  status: string
  result?: VerificationInfoResponse
}
