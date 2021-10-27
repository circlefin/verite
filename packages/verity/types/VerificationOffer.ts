import type { PresentationDefinition } from "./PresentationDefinition"
import { SubmissionOffer } from "./SubmissionOffer"

export type VerificationOffer = SubmissionOffer & {
  body: {
    presentation_definition: PresentationDefinition
  }
}
