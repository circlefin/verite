import { ValidationFailure } from "@centre/verity/dist"

export class NotFoundError extends Error {
  status = 404
  details?: string

  constructor(details?: string) {
    super("Not found")
    this.name = "NotFoundError"
    this.details = details
  }
}

export class MethodNotAllowedError extends Error {
  status = 405
  details?: string

  constructor(details?: string) {
    super("Method not allowed")
    this.name = "MethodNotAllowedError"
    this.details = details
  }
}

export class ProcessingError extends Error {
  status = 400
  failures: ValidationFailure[]

  constructor(failures: ValidationFailure[] = []) {
    super("Processing Error")
    this.name = "ProcessingError"
    this.failures = failures
  }
}
