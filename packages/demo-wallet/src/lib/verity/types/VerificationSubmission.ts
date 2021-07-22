import { VerifiedPresentation } from "did-jwt-vc"
import { JWT } from "./Jwt"
import { PresentationSubmission } from "./PresentationSubmission"

export type VerificationSubmission = {
  presentation_submission?: PresentationSubmission
  presentation: JWT
}

export type AcceptedVerificationSubmission = {
  presentation_submission?: PresentationSubmission
  presentation: VerifiedPresentation
  matches: any
}
