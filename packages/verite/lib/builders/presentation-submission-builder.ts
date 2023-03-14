import { v4 as uuidv4 } from "uuid"

import {
  ClaimFormat,
  DescriptorMap,
  PresentationDefinition,
  PresentationSubmission
} from "../../types"

export class PresentationSubmissionBuilder {
  _builder: Partial<PresentationSubmission>
  constructor(id?: string) {
    this._builder = {
      id: id ? id : uuidv4()
    }
  }

  id(id: string): PresentationSubmissionBuilder {
    this._builder.id = id
    return this
  }

  definition_id(definition_id: string): PresentationSubmissionBuilder {
    this._builder.definition_id = definition_id
    return this
  }

  descriptor_map(descriptor_map: DescriptorMap[]) {
    this._builder.descriptor_map = descriptor_map
    return this
  }

  initFromPresentationDefinition(
    presentationDefinition: PresentationDefinition
  ) {
    this._builder.definition_id = presentationDefinition.id
    this._builder.descriptor_map =
      presentationDefinition.input_descriptors.map<DescriptorMap>((d, i) => {
        return {
          id: d.id,
          format: ClaimFormat.JwtVc,
          path: `$.verifiableCredential[${i}]`
        }
      }) ?? []
    return this
  }

  build(): PresentationSubmission {
    return this._builder as PresentationSubmission
  }
}
