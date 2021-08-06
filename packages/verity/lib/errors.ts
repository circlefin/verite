export class ValidationError extends Error {
  details: string
  cause?: Error

  constructor(message: string, details: string, cause?: Error) {
    super(message)
    this.name = "ValidationError"
    this.details = details
    this.cause = cause
  }
}

export class ValidationErrorArray extends Error {
  errors: ValidationError[]

  constructor(errors: ValidationError[]) {
    super()
    this.name = "ValidationErrorArray"
    this.errors = errors
  }
}
