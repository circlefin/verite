import { SubmissionOffer } from "./SubmissionOffer"

import type { PresentationDefinition } from "./PresentationDefinition"

export type VerificationOffer = SubmissionOffer & {
  body: {
    presentation_definition: PresentationDefinition
  }
}
