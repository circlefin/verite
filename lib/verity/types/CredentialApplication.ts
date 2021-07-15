import { ClaimFormatDesignation } from ".."
import { JWT } from "./Jwt"
import { PresentationSubmission } from "./PresentationSubmission"

export type CredentialApplication = {
  credential_application: {
    id: string
    manifest_id: string
    format: ClaimFormatDesignation
  }
  presentation_submission?: PresentationSubmission
  presentation: JWT
}
