import { ClaimFormatDesignation, PresentationSubmission } from "@centre/verity"
import { VerifiedPresentation } from "did-jwt-vc"
import { CredentialMatch, ValidationFailure, Reporter } from "types"

export class ProcessedCredentialApplication {
  credential_application: {
    id: string
    manifest_id: string
    format: ClaimFormatDesignation
  }
  presentation_submission?: PresentationSubmission
  presentation: VerifiedPresentation
  reporter: Reporter

  constructor(
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    credential_application: any,
    presentation: VerifiedPresentation,
    reporter: Reporter,
    presentation_submission?: PresentationSubmission
  ) {
    this.credential_application = credential_application
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
