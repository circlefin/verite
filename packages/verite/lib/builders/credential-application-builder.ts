import { v4 as uuidv4 } from "uuid"

import {
  ClaimFormatDesignation,
  CredentialApplication,
  CredentialManifest,
  PresentationSubmission
} from "../../types"

import {
  CREDENTIAL_MANIFEST_SPEC_VERSION_1_0_0,
  JWT_VC_CLAIM_FORMAT_DESIGNATION,
  PresentationSubmissionBuilder
} from "."

export class CredentialApplicationBuilder {
  _builder: Partial<CredentialApplication>

  constructor(id?: string) {
    this._builder = {
      id: id ?? uuidv4(),
      spec_version: CREDENTIAL_MANIFEST_SPEC_VERSION_1_0_0,
      format: JWT_VC_CLAIM_FORMAT_DESIGNATION
    }
  }

  id(id: string): CredentialApplicationBuilder {
    this._builder.id = id
    return this
  }

  applicant(applicant: string): CredentialApplicationBuilder {
    this._builder.applicant = applicant
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

  initFromManifest(manifest: CredentialManifest): CredentialApplicationBuilder {
    this._builder.manifest_id = manifest.id
    if (manifest.format) {
      this._builder.format = manifest.format
    }

    if (manifest.presentation_definition) {
      this._builder.presentation_submission =
        new PresentationSubmissionBuilder()
          .initFromPresentationDefinition(manifest.presentation_definition)
          .build()
    }

    return this
  }

  build(): CredentialApplication {
    return this._builder as CredentialApplication
  }
}

/*


*/
