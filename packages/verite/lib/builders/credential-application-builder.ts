import { v4 as uuidv4 } from "uuid"

import {
  ClaimFormat,
  ClaimFormatDesignation,
  CredentialApplicationHeader,
  CredentialManifest,
  DescriptorMap,
  PresentationSubmission
} from "../../types"

import { HOLDER_PROPERTY_NAME, PresentationSubmissionBuilder } from "."

export class CredentialApplicationBuilder {
  _builder: Partial<CredentialApplicationHeader>

  constructor(id?: string) {
    this._builder = {
      id: id ? id : uuidv4()
    }
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

  // TODO: continue
  initFromManifest(manifest: CredentialManifest) {
    this._builder.manifest_id = manifest.id
    this._builder.format = {
      jwt_vp: manifest.presentation_definition?.format?.jwt_vp
    }

    if (manifest.presentation_definition) {
      this._builder.presentation_submission =
        new PresentationSubmissionBuilder()
          .id(uuidv4())
          .definition_id(manifest.presentation_definition.id)
          .descriptor_map(
            manifest.presentation_definition?.input_descriptors?.map<DescriptorMap>(
              (d) => {
                return {
                  id: d.id,
                  format: ClaimFormat.JwtVp,
                  path: `$.${HOLDER_PROPERTY_NAME}` // TOFIX: how to generalize?
                }
              }
            )
          )
          .build()
    }

    return this
  }

  build(): CredentialApplicationHeader {
    return this._builder as CredentialApplicationHeader
  }
}

/*


*/
