import { CredentialManifest } from "./CredentialManifest"
import { SubmissionRequest } from "./SubmissionRequest"

export type CredentialOffer = SubmissionRequest & {
  body: {
    manifest: CredentialManifest
  }
}
