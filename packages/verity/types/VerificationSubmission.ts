import { JWT } from "./Jwt"
import { PresentationSubmission } from "./PresentationSubmission"
import { Verifiable, W3CPresentation } from "./W3C"

type NarrowVerificationSubmission = {
  presentation_submission?: PresentationSubmission
}

export type EncodedVerificationSubmission = NarrowVerificationSubmission & {
  presentation: JWT
}
export type DecodedVerificationSubmission = NarrowVerificationSubmission & {
  presentation: Verifiable<W3CPresentation>
}
