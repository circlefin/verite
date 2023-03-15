import { v4 as uuidv4 } from "uuid"

import {
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

  // TOFIX: make casing consistent where possible (i.e. for types need to ensure serialization from direct json)
  manifestId(manifestId: string) {
    this._builder.manifest_id = manifestId
    return this
  }

  // TOFIX: accept object?
  fulfillment(descriptorMap: DescriptorMap[]) {
    this._builder.fulfillment = { descriptor_map: descriptorMap }
    return this
  }

  // TOFIX: accept object?
  denial(reason: string, inputDescriptors: string[]) {
    this._builder.denial = { reason, input_descriptors: inputDescriptors }
    return this
  }

  application_id(application_id: string) {
    this._builder.application_id = application_id
    return this
  }

  initFromManifest(manifest: CredentialManifest) {
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

  build() {
    if (!this._builder.manifest_id) throw new Error("manifest_id is required")
    if (!this._builder.fulfillment && !this._builder.denial)
      throw new Error("fulfillment or denial is required")
    return this._builder as CredentialResponse
  }
}
