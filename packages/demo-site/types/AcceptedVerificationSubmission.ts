import { PresentationSubmission } from "@centre/verity"
import { VerifiedPresentation } from "did-jwt-vc"
import { VerificationMatch } from "./Matches"

export type AcceptedVerificationSubmission = {
  presentation_submission?: PresentationSubmission
  presentation: VerifiedPresentation
  matches: Map<string, VerificationMatch[]>
}
