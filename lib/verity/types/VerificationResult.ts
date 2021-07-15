import { VerifiedCredential, VerifiedPresentation } from "did-jwt-vc"

export type Pointer = {
  pointer: string
}

export type VerificationObject = {
  status: number
  source?: Pointer // or path
  title: string
  detail: string
}

export type VerificationResult = {
  errors: VerificationObject[]
  checks: VerificationObject[]
}

export type VerificationWrapper = {
  verified: VerifiedCredential | VerifiedPresentation
  result: VerificationResult
}

export type VerifiedResult<T> = T & {
  result: VerificationResult
}

export class VerificationError extends Error {
  errors?: VerificationObject[]
  cause?: Error

  constructor(message: string, errors?: VerificationObject[], cause?: Error) {
    super(message)
    this.name = "VerificationError"
    this.cause = cause
    this.errors = errors
  }
}
