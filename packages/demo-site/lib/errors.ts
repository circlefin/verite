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

export class BadRequestError extends Error {
  status = 400
  details?: string

  constructor(details?: string) {
    super("Bad request")
    this.name = "BadRequestError"
    this.details = details
  }
}
