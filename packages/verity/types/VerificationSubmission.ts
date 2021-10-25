import type { Verifiable, W3CPresentation } from "./DidJwt"
import type { JWT } from "./Jwt"
import type { PresentationSubmission } from "./PresentationSubmission"

type NarrowVerificationSubmission = {
  presentation_submission?: PresentationSubmission
}

export type EncodedVerificationSubmission = NarrowVerificationSubmission & {
  presentation: JWT
}
export type DecodedVerificationSubmission = NarrowVerificationSubmission & {
  presentation: Verifiable<W3CPresentation>
}
