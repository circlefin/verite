import { v4 as uuidv4 } from "uuid"

import {
  CredentialApplication,
  CredentialManifest,
  CredentialResponse,
  DescriptorMap
} from "../../types"
import { CREDENTIAL_MANIFEST_SPEC_VERSION_1_0_0 } from "./common"

export class CredentialResponseBuilder {
  _builder: Partial<CredentialResponse>

  constructor(id?: string) {
    this._builder = {
      id: id ?? uuidv4(),
      spec_version: CREDENTIAL_MANIFEST_SPEC_VERSION_1_0_0
    }
  }

  manifest_id(manifest_id: string): CredentialResponseBuilder {
    this._builder.manifest_id = manifest_id
    return this
  }

  fulfillment(descriptorMap: DescriptorMap[]): CredentialResponseBuilder {
    this._builder.fulfillment = { descriptor_map: descriptorMap }
    return this
  }

  denial(
    reason: string,
    inputDescriptors: string[]
  ): CredentialResponseBuilder {
    this._builder.denial = { reason, input_descriptors: inputDescriptors }
    return this
  }

  application_id(application_id: string): CredentialResponseBuilder {
    this._builder.application_id = application_id
    return this
  }

  applicant(applicant: string): CredentialResponseBuilder {
    this._builder.applicant = applicant
    return this
  }

  initFromManifest(manifest: CredentialManifest): CredentialResponseBuilder {
    this._builder.manifest_id = manifest.id
    this._builder.fulfillment = {
      descriptor_map:
        manifest.output_descriptors.map<DescriptorMap>((d, i) => {
          return {
            id: d.id,
            format: "jwt_vc",
            path: `$.verifiableCredential[${i}]`
          }
        }) ?? []
    }
    return this
  }

  initFromApplication(
    application: Partial<CredentialApplication>
  ): CredentialResponseBuilder {
    this._builder.manifest_id = application.manifest_id // TOFIX: ensure it's the same value if already set?
    this._builder.applicant = application.applicant
    this._builder.application_id = application.id
    return this
  }

  build(): CredentialResponse {
    if (!this._builder.manifest_id) throw new Error("manifest_id is required")
    if (!this._builder.fulfillment && !this._builder.denial)
      throw new Error("fulfillment or denial is required")
    return this._builder as CredentialResponse
  }
}
