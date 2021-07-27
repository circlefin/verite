
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
    return this.reporter.passed()
  }

  errors(): ValidationFailure[] {
    return this.reporter.errors()
  }

  matches(): CredentialMatch[] {
    return this.reporter.matches()
  }

}
