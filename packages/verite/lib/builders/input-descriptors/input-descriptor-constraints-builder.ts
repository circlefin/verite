/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { cloneDeep, isEmpty } from "lodash"

import {
  InputDescriptorConstraints,
  InputDescriptorConstraintStatuses,
  InputDescriptorConstraintDirective,
  InputDescriptorConstraintField,
  InputDescriptorConstraintSubjectConstraint
} from "../../../types"
import { Action, AsSubjectConstraint } from "../common"
import { InputDescriptorConstraintFieldBuilder } from "./input-descriptor-constraints-field"

export class InputDescriptorConstraintsBuilder {
  private readonly _builder: Partial<InputDescriptorConstraints>
  constructor(initialValues?: InputDescriptorConstraints) {
    if (initialValues) {
      this._builder = {
        fields: [],
        is_holder: [],
        ...cloneDeep(initialValues)
      }
    } else {
      this._builder = {
        fields: [],
        is_holder: []
      }
    }
  }

  fields(
    fields: InputDescriptorConstraintField[]
  ): InputDescriptorConstraintsBuilder {
    this._builder.fields = fields
    return this
  }

  addField(
    itemBuilder: Action<InputDescriptorConstraintFieldBuilder>
  ): InputDescriptorConstraintsBuilder {
    const b = new InputDescriptorConstraintFieldBuilder()
    itemBuilder(b)
    const result = b.build()
    if (!isEmpty(result)) {
      this._builder.fields!.push(result)
    }
    return this
  }

  statuses(
    statuses: InputDescriptorConstraintStatuses
  ): InputDescriptorConstraintsBuilder {
    this._builder.statuses = statuses
    return this
  }

  subjectIsIssuer(
    directive: InputDescriptorConstraintDirective
  ): InputDescriptorConstraintsBuilder {
    this._builder.subject_is_issuer = directive
    return this
  }

  sameSubject(
    constraints: InputDescriptorConstraintSubjectConstraint[]
  ): InputDescriptorConstraintsBuilder {
    this._builder.same_subject = constraints
    return this
  }

  isHolder(
    holderConstraint: string[] | InputDescriptorConstraintSubjectConstraint
  ): InputDescriptorConstraintsBuilder {
    this._builder.is_holder!.push(AsSubjectConstraint(holderConstraint))
    return this
  }

  build(): InputDescriptorConstraints {
    if (isEmpty(this._builder.fields)) {
      delete this._builder.fields
    }
    if (isEmpty(this._builder.is_holder)) {
      delete this._builder.is_holder
    }
    return this._builder
  }
}
