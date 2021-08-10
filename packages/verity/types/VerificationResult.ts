export type VerificationInfo = {
  credentialType: string
  message: string
  expiration: number
  subjectAddress: string
}

export type VerificationInfoResponse = {
  verificationInfo: VerificationInfo
  signature: string
}
