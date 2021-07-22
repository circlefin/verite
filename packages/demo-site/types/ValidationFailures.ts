export type ValidationFailure = {
  status: number
  source?: {
    pointer: string // or path...
  }
  title: string
  detail: string
}

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
