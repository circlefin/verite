export class VerificationError extends Error {
  cause?: Error

  constructor(message: string, cause?: Error) {
    super(message)
    this.name = "VerificationError"
    this.cause = cause
  }
}
