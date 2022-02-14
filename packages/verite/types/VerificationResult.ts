export type VerificationResult = {
  schema: string
  subject: string
  expiration: number
}

export type VerificationResultResponse = {
  verificationResult: VerificationResult
  signature: string
}
