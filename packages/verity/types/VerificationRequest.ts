import type { PresentationDefinition } from "./PresentationDefinition"
import { SubmissionRequest } from "./SubmissionRequest"

export type VerificationRequest = SubmissionRequest & {
  body: {
    presentation_definition: PresentationDefinition
  }
}
