import { ClaimFormatDesignation, InputDescriptor } from "../../../types"
import { Action, JWT_CLAIM_FORMAT_DESIGNATION } from "../common"
import { InputDescriptorConstraintsBuilder } from "./input-descriptor-constraints-builder"


export class InputDescriptorBuilder {
  private readonly _builder: Partial<InputDescriptor>

  constructor(id?: string) {
    this._builder = {}
    if (id) {
      this._builder.id = id
    }
  }

  id(id: string): InputDescriptorBuilder {
    this._builder.id = id
    return this
  }  

  name(name: string): InputDescriptorBuilder {
    this._builder.name = name
    return this
  }
  
  purpose(purpose: string): InputDescriptorBuilder {
    this._builder.purpose = purpose
    return this
  }

  constraints(itemBuilder: Action<InputDescriptorConstraintsBuilder>) {
    const b = new InputDescriptorConstraintsBuilder()
    itemBuilder(b)
    this._builder.constraints = b.build()

    return this
  }

  format(format: ClaimFormatDesignation) {
    this._builder.format = format
    return this
  }

  build(): InputDescriptor {
    if (!this._builder.format) {
      this._builder.format = JWT_CLAIM_FORMAT_DESIGNATION
    }
    return this._builder as InputDescriptor
  }
}

