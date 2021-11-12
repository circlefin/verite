import type { DescriptorMap } from "./DescriptorMap"
import type { Verifiable, W3CPresentation } from "./DidJwt"
import type { JWT } from "./Jwt"

type NarrowPresentationSubmission = {
  presentation_submission?: PresentationSubmission
}

export type PresentationSubmission = {
  id: string
  definition_id: string
  descriptor_map: DescriptorMap[]
}

export type EncodedPresentationSubmission = JWT

export type DecodedPresentationSubmission = NarrowPresentationSubmission &
  Verifiable<W3CPresentation>
