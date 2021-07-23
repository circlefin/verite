import { PresentationSubmission } from "@centre/verity"
import { VerifiedPresentation } from "did-jwt-vc"
import { ValidationCheck } from "./Matches"

export class ProcessedVerificationSubmission {
  presentation_submission?: PresentationSubmission
  presentation: VerifiedPresentation
  validationChecks: Map<string, ValidationCheck[]>

  constructor(
    presentation: VerifiedPresentation,
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
