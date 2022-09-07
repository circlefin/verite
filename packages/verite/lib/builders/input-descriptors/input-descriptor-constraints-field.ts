import {
  InputDescriptorConstraintField,
  InputDescriptorConstraintFilter,
  InputDescriptorConstraintDirective
} from "../../../types"

export class InputDescriptorConstraintFieldBuilder {
  private readonly _builder: Partial<InputDescriptorConstraintField>
  constructor() {
    this._builder = {}
  }

  id(id: string): InputDescriptorConstraintFieldBuilder {
    this._builder.id = id
    return this
  }

  path(path: string[]): InputDescriptorConstraintFieldBuilder {
    this._builder.path = path
    return this
  }

  filter(
    filter: InputDescriptorConstraintFilter
  ): InputDescriptorConstraintFieldBuilder {
    this._builder.filter = filter
    return this
  }

  predicate(
    predicate: InputDescriptorConstraintDirective
  ): InputDescriptorConstraintFieldBuilder {
    this._builder.predicate = predicate
    return this
  }

  purpose(purpose: string): InputDescriptorConstraintFieldBuilder {
    this._builder.purpose = purpose
    return this
  }

  build(): InputDescriptorConstraintField {
    return this._builder as InputDescriptorConstraintField
  }
}
