import {
  DecodedVerificationSubmission,
  PresentationSubmission,
  Verifiable,
  W3CPresentation
} from "@centre/verity"
import { ValidationCheck } from "./Matches"

export class ProcessedVerificationSubmission
  implements DecodedVerificationSubmission
{
  presentation_submission?: PresentationSubmission
  presentation: Verifiable<W3CPresentation>
  validationChecks: Map<string, ValidationCheck[]>

  constructor(
    presentation: Verifiable<W3CPresentation>,
    validationChecks: Map<string, ValidationCheck[]>,
    presentation_submission?: PresentationSubmission
  ) {
    this.presentation = presentation
    this.validationChecks = validationChecks
    this.presentation_submission = presentation_submission
  }

  accepted(): boolean {
    const accepted = Object.keys(this.validationChecks).every((key) => {
      return this.validationChecks[key].every((c) => {
        return c.passed()
      })
    })
    return accepted
  }
}
