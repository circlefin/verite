export type VerificationResult = {
  schema: string
  subject: string
  expiration: number
  payload: string
}

export type VerificationResultResponse = {
  verificationResult: VerificationResult
  signature: string
}
