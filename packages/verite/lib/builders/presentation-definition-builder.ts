import { ClaimFormatDesignation, PresentationDefinition } from "../../types"
import {
  InputDescriptorBuilder,
  IsEmpty
} from "../utils"
import { Action } from "./common"


export class PresentationDefinitionBuilder {
  _builder: Partial<PresentationDefinition>
  constructor(id: string) {
    this._builder = {
      id: id
    }
  }

  format(format: ClaimFormatDesignation): PresentationDefinitionBuilder {
    this._builder.format = format
    return this
  }

  withInputDescriptor(id: string, itemBuilder: Action<InputDescriptorBuilder>): PresentationDefinitionBuilder {
    if (IsEmpty(this._builder.input_descriptors)) {
      this._builder.input_descriptors = []
    }
    const b = new InputDescriptorBuilder(id)
    itemBuilder(b)
    const result = b.build()
    if (Object.keys(result).length === 0)
      return this
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this._builder.input_descriptors!.push(b.build())
    return this
  }

  build(): PresentationDefinition {
    return this._builder as PresentationDefinition
  }
}
