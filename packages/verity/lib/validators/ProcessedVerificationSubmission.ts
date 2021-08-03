import type {
  DecodedVerificationSubmission,
  PresentationSubmission,
  Verifiable,
  W3CPresentation,
  CredentialMatch,
  ValidationFailure
} from "../../types"
import type { ValidationCheck } from "./Matches"
import { ValidationCheckFormatter } from "./Matches"

export class ProcessedVerificationSubmission
  implements DecodedVerificationSubmission
{
  presentation_submission?: PresentationSubmission
  presentation: Verifiable<W3CPresentation>
  validationChecks: ValidationCheck[]
  formatter: ValidationCheckFormatter

  constructor(
    presentation: Verifiable<W3CPresentation>,
    validationChecks: ValidationCheck[],
    presentation_submission?: PresentationSubmission
  ) {
    this.presentation = presentation
    this.validationChecks = validationChecks
    this.presentation_submission = presentation_submission
    this.formatter = new ValidationCheckFormatter(validationChecks)
  }

  accepted(): boolean {
    return this.formatter.accepted()
  }

  errors(): ValidationFailure[] {
    return this.formatter.errors()
  }

  results(): CredentialMatch[] {
    return this.formatter.results()
  }
}
