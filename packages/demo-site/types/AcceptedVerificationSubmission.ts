import { PresentationSubmission } from "@centre/verity"
import { VerifiedPresentation } from "did-jwt-vc"

export type AcceptedVerificationSubmission = {
  presentation_submission?: PresentationSubmission
  presentation: VerifiedPresentation
  matches: any
}
