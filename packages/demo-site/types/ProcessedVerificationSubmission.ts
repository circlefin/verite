import { PresentationSubmission } from "@centre/verity"
import { VerifiedPresentation } from "did-jwt-vc"
import { CredentialMatch, ValidationFailure, Reporter } from "types"

export class ProcessedVerificationSubmission {
  presentation_submission?: PresentationSubmission
  presentation: VerifiedPresentation
  reporter: Reporter

  constructor(
    presentation: VerifiedPresentation,
    reporter: Reporter,
    presentation_submission?: PresentationSubmission
  ) {
    this.presentation = presentation
    this.reporter = reporter
    this.presentation_submission = presentation_submission
  }

  accepted(): boolean {
    return this.reporter.passed()
  }

  errors(): ValidationFailure[] {
    return this.reporter.errors()
  }

  matches(): CredentialMatch[] {
    return this.reporter.matches()
  }

}
