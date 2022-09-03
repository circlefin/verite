import { InputDescriptorConstraints, InputDescriptorConstraintStatuses, InputDescriptorConstraintDirective } from "../../../types"
import { IsEmpty } from "../../utils/collection-utils"
import { Action } from "../common"
import { InputDescriptorConstraintFieldBuilder } from "./input-descriptor-constraints-field"


export class InputDescriptorConstraintsBuilder {
  private readonly _builder: Partial<InputDescriptorConstraints>
  constructor() {
    this._builder = {}
  }

  withFieldConstraint(itemBuilder: Action<InputDescriptorConstraintFieldBuilder>): InputDescriptorConstraintsBuilder {
    if (IsEmpty(this._builder.fields)) {
      this._builder.fields = []
    }
    const b = new InputDescriptorConstraintFieldBuilder()
    itemBuilder(b)
    const result = b.build()
    if (Object.keys(result).length === 0) return this
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this._builder.fields!.push(b.build())
    return this
  }

  statuses(statuses: InputDescriptorConstraintStatuses): InputDescriptorConstraintsBuilder {
    this._builder.statuses = statuses
    return this
  }

  isHolder(fieldId: string[], directive: InputDescriptorConstraintDirective = InputDescriptorConstraintDirective.REQUIRED): InputDescriptorConstraintsBuilder {
    if (IsEmpty(fieldId)) return this
    if (IsEmpty(this._builder.is_holder)) {
      this._builder.is_holder = []
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this._builder.is_holder!.push({
      field_id: fieldId,
      directive: directive
    })
    return this
  }

  build(): InputDescriptorConstraints {
    return this._builder
  }
}
