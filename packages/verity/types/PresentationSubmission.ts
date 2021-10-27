import type { DescriptorMap } from "./DescriptorMap"
import type { Verifiable, W3CPresentation } from "./DidJwt"
import type { JWT } from "./Jwt"

export type PresentationSubmission = {
  id: string
  definition_id: string
  descriptor_map: DescriptorMap[]
}

type NarrowVerificationSubmission = {
  presentation_submission?: PresentationSubmission
}

export type EncodedPresentationSubmission = NarrowVerificationSubmission & {
  presentation: JWT
}
export type DecodedPresentationSubmission = NarrowVerificationSubmission & {
  presentation: Verifiable<W3CPresentation>
}
