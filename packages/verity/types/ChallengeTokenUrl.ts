import {
  CredentialOffer,
  SubmissionRequest,
  VerificationRequest
} from "./VerificationRequest"

/**
 * A Wrapper object to be used to as a QR Code payload pointing to
 * a manifest or a verifier.
 */
export type ChallengeTokenUrlWrapper = {
  challengeTokenUrl: string
}

export type RequestWrapper<T extends SubmissionRequest> = {
  request: T
}

export type ManifestWrapper = RequestWrapper<CredentialOffer>

export type VerificationRequestWrapper = RequestWrapper<VerificationRequest>
