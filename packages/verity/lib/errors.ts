import { ValidationFailure } from "../types"

export class ValidationError extends Error {
  failures: ValidationFailure[]
  cause?: Error

  constructor(
    message: string,
    failures: ValidationFailure | ValidationFailure[],
    cause?: Error
  ) {
    super(message)
    this.name = "ValidationError"
    this.failures = Array.isArray(failures) ? failures : [failures]
    this.cause = cause
  }
}

export class VerificationError extends Error {
  cause?: Error

  constructor(message: string, cause?: Error) {
    super(message)
    this.name = "VerificationError"
    this.cause = cause
  }
}
