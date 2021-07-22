export type VerificationObject = {
  status: number
  source?: {
    pointer: string // or path...
  }
  title: string
  detail: string
}

export type Verified<T> = T & {
  checks: VerificationObject[]
}

export class VerificationError extends Error {
  errors?: VerificationObject[]
  cause?: Error

  constructor(message: string, cause?: Error) {
    super(message)
    this.name = "VerificationError"
    this.cause = cause
    if (cause) {
      this.errors = [toErrorObject(cause)]
    }

    // TODO(kim): very coarse mapping until I add up-front checks
    function toErrorObject(err: Error) {
      return {
        status: 400,
        title: err.name,
        detail: err.message
      }
    }
  }
}
