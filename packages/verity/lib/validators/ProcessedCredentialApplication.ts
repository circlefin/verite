import type {
  ClaimFormatDesignation,
  DecodedCredentialApplication,
  PresentationSubmission,
  Verifiable,
  W3CPresentation,
  CredentialMatch,
  ValidationFailure,
  CredentialApplicationHeader
} from "../../types"
import type { ValidationCheck } from "./Matches"
import { ValidationCheckFormatter } from "./Matches"

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
    credential_application: CredentialApplicationHeader,
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
