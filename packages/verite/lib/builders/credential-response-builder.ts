import { v4 as uuidv4 } from "uuid"

import {
  ClaimFormat,
  CredentialManifest,
  CredentialResponse,
  DescriptorMap
} from "../../types"

export class CredentialResponseBuilder {
  _builder: Partial<CredentialResponse>

  constructor(id?: string) {
    this._builder = {
      id: id ? id : uuidv4()
    }
  }

  manifestId(manifestId: string) {
    this._builder.manifest_id = manifestId
    return this
  }

  descriptorMap(descriptorMap: DescriptorMap[]) {
    this._builder.descriptor_map = descriptorMap
    return this
  }

  initFromManifest(manifest: CredentialManifest) {
    this._builder.manifest_id = manifest.id
    this._builder.descriptor_map =
      manifest.output_descriptors.map<DescriptorMap>((d, i) => {
        return {
          id: d.id,
          format: ClaimFormat.JwtVc,
          path: `$.verifiableCredential[${i}]`
        }
      }) ?? []
    return this
  }

  build() {
    return this._builder as CredentialResponse
  }
}
