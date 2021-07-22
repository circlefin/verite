export type VerificationObject = {
  status: number
  source?: {
    path: string
  }
  title: string
  detail: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  original?: any
}

export type Verified<T> = T & {
  checks: VerificationObject[]
}

export class VerificationError extends Error {
  errors?: VerificationObject[]
  cause?: Error

  constructor(message: string, errors?: VerificationObject[], cause?: Error) {
    super(message)
    this.name = "VerificationError"
    this.cause = cause
    if (errors) {
      this.errors = errors
    } else {
      const vo: VerificationObject = {
        title: message,
        detail: message,
        status: 400 // TODO
      }
      this.errors = [vo]
    }
  }
}
