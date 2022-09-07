/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { cloneDeep, isEmpty } from "lodash"

import {
  ClaimFormatDesignation,
  InputDescriptor,
  PresentationDefinition
} from "../../types"
import { Action } from "./common"
import { InputDescriptorBuilder } from "./input-descriptors"

export class PresentationDefinitionBuilder {
  _builder: Partial<PresentationDefinition>
  constructor(initialValues: Partial<PresentationDefinition>) {
    this._builder = {
      input_descriptors: [],
      ...cloneDeep(initialValues)
    }
  }

  format(format: ClaimFormatDesignation): PresentationDefinitionBuilder {
    this._builder.format = format
    return this
  }

  input_descriptors(input_descriptors: InputDescriptor[]) {
    this._builder.input_descriptors = input_descriptors
    return this
  }

  addInputDescriptor(
    id: string,
    itemBuilder: Action<InputDescriptorBuilder>
  ): PresentationDefinitionBuilder {
    const b = new InputDescriptorBuilder(id)
    itemBuilder(b)
    const result = b.build()
    if (!isEmpty(result)) {
      this._builder.input_descriptors!.push(result)
    }
    return this
  }

  build(): PresentationDefinition {
    if (isEmpty(this._builder.input_descriptors)) {
      delete this._builder.input_descriptors
    }
    return this._builder as PresentationDefinition
  }
}
