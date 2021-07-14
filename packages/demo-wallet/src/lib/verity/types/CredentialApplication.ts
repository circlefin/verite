import { JWT } from "did-jwt-vc/lib/types"
import { ClaimFormatDesignation } from ".."
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
