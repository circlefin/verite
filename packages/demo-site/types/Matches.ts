import {
  InputDescriptorConstraintField,
  Verifiable,
  W3CCredential
} from "@centre/verity"
import { CredentialMatch, PathEvaluation, ValidationFailure } from "./"

// TODO
export class PathMatches {
  path: string
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  matchedValue: any

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  constructor(path: string, matchedValue: any) {
    this.path = path
    this.matchedValue = matchedValue
  }
}

class Evaluation<T> {
  constraint: T
  constructor(constraint: T) {
    this.constraint = constraint
  }

  passed(): boolean {
    return false
  }
}

export class FieldConstraintEvaluation extends Evaluation<InputDescriptorConstraintField> {
  _match: PathEvaluation
  _failures: PathEvaluation[]
  constructor(
    constraint: InputDescriptorConstraintField,
    match: PathEvaluation,
    failures: PathEvaluation[]
  ) {
    super(constraint)
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

export class CredentialResults {
  credential: Verifiable<W3CCredential>
  constraintChecks: FieldConstraintEvaluation[]

  constructor(
    credential: Verifiable<W3CCredential>,
    constraintChecks: FieldConstraintEvaluation[]
  ) {
    this.credential = credential
    this.constraintChecks = constraintChecks
  }

  passed(): boolean {
    return this.constraintChecks.every((c) => c.passed())
  }
}

export class ValidationCheck {
  descriptorId: string
  credentialResults: CredentialResults[]

  constructor(descriptorId: string, credentialResults: CredentialResults[]) {
    this.descriptorId = descriptorId
    this.credentialResults = credentialResults
  }

  passed(): boolean {
    return this.credentialResults.some((c) => c.passed())
  }

  results(): CredentialMatch[] {
    if (!this.passed()) return null
    return this.credentialResults
      .filter((c) => c.passed())
      .flatMap((d) => {
        return {
          inputDescriptorId: this.descriptorId,
          results: d.constraintChecks?.flatMap((f) => {
            return {
              constraint: f.constraint,
              match: f.match()
            }
          }),
          credential: d.credential
        }
      })
  }

  errors(): ValidationFailure[] {
    if (this.passed()) return null
    return this.credentialResults
      .filter((c) => !c.passed())
      .flatMap((d) => {
        return {
          message: `Credential failed to meet criteria specified by input descriptor ${this.descriptorId}`,
          details: `Credential did not match constraint: ${d.constraintChecks[0].constraint.purpose}`,
          results: d.constraintChecks?.flatMap((f) => {
            return {
              constraint: f.constraint,
              failures: f.failures()
            }
          })
        }
      })
  }
}

export class ValidationCheckFormatter {
  checks: ValidationCheck[]
  constructor(checks: ValidationCheck[]) {
    this.checks = checks
  }
  accepted(): boolean {
    return this.checks.every((v) => v.passed())
  }

  errors(): ValidationFailure[] {
    if (this.accepted()) return null
    return this.checks.flatMap((c) => c.errors())
  }

  results(): CredentialMatch[] {
    if (!this.accepted()) return null
    return this.checks.flatMap((c) => c.results())
  }
}
