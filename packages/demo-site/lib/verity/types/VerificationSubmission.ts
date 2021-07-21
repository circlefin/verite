import { VerifiedPresentation } from "did-jwt-vc"
import { JWT } from "./Jwt"
import { PresentationSubmission } from "./PresentationSubmission"
import { Verified } from "./VerificationResult"

export type VerificationSubmission = {
  presentation_submission?: PresentationSubmission
  presentation: JWT
}

export type AcceptedVerificationSubmission = VerificationSubmission & {
  verified: Verified<VerifiedPresentation>
}
