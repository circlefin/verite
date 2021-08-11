export type KYCVerificationInfo = {
  message: string;
  expiration: number;
  subjectAddress: string;
};

export type VerificationInfoResponse = {
  verificationInfo: KYCVerificationInfo;
  signature: string
};
