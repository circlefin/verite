import { ClaimFormatDesignation, PresentationSubmission } from "@centre/verity"
import { VerifiedPresentation } from "did-jwt-vc"
import { VerificationMatch } from "./Matches"

export type AcceptedCredentialApplication = {
  credential_application: {
    id: string
    manifest_id: string
    format: ClaimFormatDesignation
  }
  presentation_submission?: PresentationSubmission
  presentation: VerifiedPresentation
  matches: Map<string, VerificationMatch[]>
}
