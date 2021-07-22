import { ClaimFormatDesignation, PresentationSubmission } from "@centre/verity"
import { VerifiedPresentation } from "did-jwt-vc"

export type AcceptedCredentialApplication = {
  credential_application: {
    id: string
    manifest_id: string
    format: ClaimFormatDesignation
  }
  presentation_submission?: PresentationSubmission
  presentation: VerifiedPresentation
  matches: any
}
