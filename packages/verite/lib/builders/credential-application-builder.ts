import {
  ClaimFormatDesignation,
  CredentialApplicationHeader,
  PresentationSubmission
} from "../../types"

export class CredentialApplicationBuilder {
  _builder: Partial<CredentialApplicationHeader>

  constructor() {
    this._builder = {}
  }

  id(id: string): CredentialApplicationBuilder {
    this._builder.id = id
    return this
  }

  manifest_id(manifest_id: string): CredentialApplicationBuilder {
    this._builder.manifest_id = manifest_id
    return this
  }

  format(format: ClaimFormatDesignation): CredentialApplicationBuilder {
    this._builder.format = format
    return this
  }

  presentation_submission(
    presentation_submission: PresentationSubmission
  ): CredentialApplicationBuilder {
    this._builder.presentation_submission = presentation_submission
    return this
  }

  build(): CredentialApplicationHeader {
    return this._builder as CredentialApplicationHeader
  }
}
