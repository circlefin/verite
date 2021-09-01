export class ValidationError extends Error {
  details?: string
  cause?: Error

  constructor(message: string, details?: string, cause?: Error) {
    super(message)
    this.name = "ValidationError"
    this.details = details
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
