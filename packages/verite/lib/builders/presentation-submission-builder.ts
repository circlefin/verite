/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { cloneDeep } from "lodash"
import { type } from "os"

import {
  DescriptorMap,
  PresentationSubmission
} from "../../types"

export class PresentationSubmissionBuilder {
  _builder: Partial<PresentationSubmission>
  constructor() {
    this._builder = {
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


  build(): PresentationSubmission {
    return this._builder as PresentationSubmission
  }
}
