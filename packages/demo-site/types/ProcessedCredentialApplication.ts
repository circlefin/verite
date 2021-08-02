import type {
  ClaimFormatDesignation,
  DecodedCredentialApplication,
  PresentationSubmission,
  Verifiable,
  W3CPresentation
} from "@centre/verity"
import type { ValidationCheck } from "./Matches"
import { ValidationCheckFormatter } from "./Matches"
import type { CredentialMatch, ValidationFailure } from "./ValidationResults"
export class ProcessedCredentialApplication
  implements DecodedCredentialApplication
{
  credential_application: {
    id: string
    manifest_id: string
    format: ClaimFormatDesignation
  }
  presentation_submission?: PresentationSubmission
  presentation: Verifiable<W3CPresentation>
  validationChecks: ValidationCheck[]
  formatter: ValidationCheckFormatter

  constructor(
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    credential_application: any,
    presentation: Verifiable<W3CPresentation>,
    validationChecks: ValidationCheck[],
    presentation_submission?: PresentationSubmission
  ) {
    this.credential_application = credential_application
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
