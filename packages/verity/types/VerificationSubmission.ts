import { JWT } from "./Jwt"
import { PresentationSubmission } from "./PresentationSubmission"

export type VerificationSubmission = {
  presentation_submission?: PresentationSubmission
  presentation: JWT
}
