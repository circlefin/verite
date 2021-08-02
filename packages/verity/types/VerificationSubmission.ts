import type { JWT } from "./Jwt"
import type { PresentationSubmission } from "./PresentationSubmission"
import type { Verifiable, W3CPresentation } from "./W3C"

type NarrowVerificationSubmission = {
  presentation_submission?: PresentationSubmission
}

export type EncodedVerificationSubmission = NarrowVerificationSubmission & {
  presentation: JWT
}
export type DecodedVerificationSubmission = NarrowVerificationSubmission & {
  presentation: Verifiable<W3CPresentation>
}
