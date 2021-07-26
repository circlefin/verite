import {
  ClaimFormatDesignation,
  DecodedCredentialApplication,
  PresentationSubmission,
  Verifiable,
  W3CPresentation
} from "@centre/verity"
import { ValidationCheck } from "./Matches"
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
  validationChecks: Map<string, ValidationCheck[]>

  constructor(
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    credential_application: any,
    presentation: Verifiable<W3CPresentation>,
    validationChecks: Map<string, ValidationCheck[]>,
    presentation_submission?: PresentationSubmission
  ) {
    this.credential_application = credential_application
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
