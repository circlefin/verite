import { Verifiable, W3CPresentation } from "did-jwt-vc"
import { JWT } from "./Jwt"
import { PresentationSubmission } from "./PresentationSubmission"

type NarrowVerificationSubmission = {
  presentation_submission?: PresentationSubmission
}

export type GenericVerificationSubmission = NarrowVerificationSubmission & {
  presentation: JWT | Verifiable<W3CPresentation>
}

export type EncodedVerificationSubmission = NarrowVerificationSubmission & {
  presentation: JWT
}
export type DecodedVerificationSubmission = NarrowVerificationSubmission & {
  presentation: Verifiable<W3CPresentation>
}
