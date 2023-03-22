import type { ClaimFormatDesignation } from "./ClaimFormatDesignation"
import type { PresentationSubmission } from "./PresentationSubmission"

export type CredentialApplication = {
  id: string
  spec_version: string
  manifest_id: string
  format: ClaimFormatDesignation
  applicant: string
  presentation_submission?: PresentationSubmission
}

// FOLLOW_UP: constrain T?
export type CredentialApplicationWrapper<T> = {
  credential_application: CredentialApplication
  verifiableCredential?: T[]
}
