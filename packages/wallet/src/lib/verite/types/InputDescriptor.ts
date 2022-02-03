// https://identity.foundation/presentation-exchange/#input-descriptor-object

import type { Schema } from "./Schema"

export enum InputDescriptorConstraintStatusDirective {
  REQUIRED = "required",
  ALLOWED = "allowed",
  DISALLOWED = "disallowed"
}

export type InputDescriptorConstraintStatus = {
  directive: InputDescriptorConstraintStatusDirective
}

export type InputDescriptorConstraintStatuses = {
  active?: InputDescriptorConstraintStatus
  suspended?: InputDescriptorConstraintStatus
  revoked?: InputDescriptorConstraintStatus
}

export enum InputDescriptorConstraintSubjectConstraintDirective {
  REQUIRED = "required",
  PREFERRED = "preferred"
}

export type InputDescriptorConstraintSubjectConstraint = {
  field_id: string[]
  directive: InputDescriptorConstraintSubjectConstraintDirective
}

export type InputDescriptorConstraintFilter = {
  type: string
  format?: string
  pattern?: string
  minimum?: string | number
  minLength?: number
  maxLength?: number
  exclusiveMinimum?: string | number
  exclusiveMaximum?: string | number
  maximum?: string | number
  const?: string | number
  enum?: string[] | number[]
  not?: InputDescriptorConstraintFilter
}

export type InputDescriptorConstraintField = {
  path: string[]
  id?: string
  purpose?: string
  filter?: InputDescriptorConstraintFilter
  predicate?: "required" | "preferred"
}

export type InputDescriptorConstraints = {
  limit_disclosure?: "required" | "preferred"
  statuses?: InputDescriptorConstraintStatuses
  subject_is_issuer?: "required" | "preferred"
  is_holder?: InputDescriptorConstraintSubjectConstraint[]
  same_subject?: InputDescriptorConstraintSubjectConstraint[]
  fields?: InputDescriptorConstraintField[]
}

export type InputDescriptor = {
  id: string
  schema: Schema[]
  group?: string
  name?: string
  purpose?: string
  constraints?: InputDescriptorConstraints
}
