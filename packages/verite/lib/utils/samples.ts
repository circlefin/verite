import { CreditScoreAttestation, KYCAMLAttestation } from "../../types"
import { getAttestionInformation } from "./attestation-registry"


export function getSampleKycAmlAttestation() : KYCAMLAttestation {
  const kycInfo = getAttestionInformation("KYCAMLAttestation")
  return {
    type: kycInfo.type,
    process: kycInfo.process!,
    approvalDate: new Date().toISOString()
  }
}

export function getSampleCreditScoreAttestation(score: number) : CreditScoreAttestation {
  return {
    type: "CreditScoreAttestation",
    score: score,
    scoreType: "Credit Score",
    provider: "Experian"
  }
}