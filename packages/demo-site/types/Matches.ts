import { VerifiedCredential } from "@centre/verity"

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

export class ConstraintCheck {
  constraintFieldIndex: number
  pathMatches: PathMatches[]

  constructor(constraintFieldIndex: number, pathMatches: PathMatches[]) {
    this.constraintFieldIndex = constraintFieldIndex
    this.pathMatches = pathMatches
  }

  hasMatches(): boolean {
    return this.pathMatches?.length > 0
  }
}

export class ValidationCheck {
  descriptorId: string
  credential: VerifiedCredential
  constraintChecks: ConstraintCheck[]

  constructor(
    descriptorId: string,
    credential: VerifiedCredential,
    constraintChecks: ConstraintCheck[]
  ) {
    this.descriptorId = descriptorId
    this.credential = credential
    this.constraintChecks = constraintChecks
  }

  passed(): boolean {
    if (this.constraintChecks === null || this.constraintChecks.length === 0) {
      return true
    }
    const result = this.constraintChecks.every((c) => {
      return c.hasMatches()
    })
    return result
  }
}
