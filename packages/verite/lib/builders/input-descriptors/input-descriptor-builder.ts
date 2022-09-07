import {
  ClaimFormatDesignation,
  InputDescriptor,
  InputDescriptorConstraints
} from "../../../types"
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

  constraints(constraints: InputDescriptorConstraints): InputDescriptorBuilder {
    this._builder.constraints = constraints
    return this
  }

  withConstraints(
    itemBuilder: Action<InputDescriptorConstraintsBuilder>
  ): InputDescriptorBuilder {
    const b = new InputDescriptorConstraintsBuilder(this._builder.constraints)
    itemBuilder(b)
    this._builder.constraints = b.build()
    return this
  }

  format(format: ClaimFormatDesignation): InputDescriptorBuilder {
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
