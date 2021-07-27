import {
  InputDescriptorConstraintField,
  InputDescriptorConstraints
} from "@centre/verity"
import { VerifiedCredential } from "did-jwt-vc"
import { CredentialMatch, PathEvaluation, ValidationFailure } from "types"

export interface MatchResult<T> {
  match(): T
  failures(): T[]
  passed(): boolean
}

export interface MatchResults<T> {
  matches(): T[]
  failure(): T
  passed(): boolean
}

interface Rule<T> {
  constraint: T
}

/**
 * Stores the result of a field constraint evaluation.
 *
 */
export class FieldConstraintEvaluation
  implements Rule<InputDescriptorConstraintField>, MatchResult<PathEvaluation>
{
  constraint: InputDescriptorConstraintField
  _match: PathEvaluation
  _failures: PathEvaluation[]
  constructor(
    rule: InputDescriptorConstraintField,
    match: PathEvaluation,
    failures: PathEvaluation[]
  ) {
    this.constraint = rule
    this._match = match
    this._failures = failures
  }
  passed(): boolean {
    return this._failures === null || this._failures.length === 0
  }
  match(): PathEvaluation {
    return this._match
  }
  failures(): PathEvaluation[] {
    return this._failures
  }
}

/**
 * Stores the result of a descriptor validation check.
 *
 * Right now, the only supported constraint checks are those requiring each specified field to have a match (among a set of possible paths).
 *
 * The validation check passed if either cases apply:
 * - there are no constraints, or
 * - there are constraints and each field has a path match.
 */
export class CredentialEvaluation
  implements
    Rule<InputDescriptorConstraints>,
    MatchResults<FieldConstraintEvaluation>
{
  constraint: InputDescriptorConstraints
  _matches: FieldConstraintEvaluation[]
  _failure: FieldConstraintEvaluation
  credential: VerifiedCredential
  credentialId: string

  constructor(
    constraint: InputDescriptorConstraints,
    matches: FieldConstraintEvaluation[],
    failure: FieldConstraintEvaluation,
    credential: VerifiedCredential
  ) {
    this.constraint = constraint
    this._matches = matches
    this._failure = failure
    this.credential = credential
  }

  matches(): FieldConstraintEvaluation[] {
    return this._matches
  }

  failure(): FieldConstraintEvaluation {
    return this._failure
  }

  passed(): boolean {
    return this._failure === null
  }

  // TODO: this is a workaround
  failureReason(): string {
    return this._failure.constraint.purpose
  }
}

export class InputDescriptorEvaluation {
  inputDescriptorId: string
  credentialEvaluations: CredentialEvaluation[]

  constructor(
    inputDescriptorId: string,
    credentialEvaluations: CredentialEvaluation[]
  ) {
    this.inputDescriptorId = inputDescriptorId
    this.credentialEvaluations = credentialEvaluations
  }

  passed(): boolean {
    return this.credentialEvaluations.some((c) => c.passed())
  }

  errors(): ValidationFailure[] {
    if (this.passed()) return null
    return this.credentialEvaluations.map((c) => {
      return {
        message: `Credential failed to meet criteria specified by input descriptor ${this.inputDescriptorId}`,
        details: `Credential did not match constraint: ${c.failureReason()}`,
        results: {
          constraint: c.failure().constraint,
          failures: c.failure().failures().flatMap(d => d)
        }
      }
    })
  }

  match(): CredentialMatch[] {
    if (!this.passed()) return null
    return this.credentialEvaluations.map((c) => {
      return {
        inputDescriptorId: this.inputDescriptorId,
        credentialId: c.credentialId,
        results: c.matches().flatMap((m) => {
          return {
            constraint: m.constraint,
            match: m.match()
          }
        })
      }
    })
  }
}

export class Reporter {
  inputEvaluations: InputDescriptorEvaluation[]

  constructor(evaluations: InputDescriptorEvaluation[]) {
    this.inputEvaluations = evaluations
  }

  passed(): boolean {
    return this.inputEvaluations.every((e) => e.passed())
  }

  matches(): CredentialMatch[] {
    return this.inputEvaluations.flatMap((e) => e.match())
  }

  errors(): ValidationFailure[] {
    return this.inputEvaluations
      .filter((e) => !e.passed())
      .flatMap((d) => d.errors())
  }
}
