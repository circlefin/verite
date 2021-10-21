import { CredentialManifest } from "./CredentialManifest"
import { SubmissionOffer } from "./SubmissionOffer"

export type CredentialOffer = SubmissionOffer & {
  body: {
    manifest: CredentialManifest
  }
}
