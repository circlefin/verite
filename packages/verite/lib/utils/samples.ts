import { CreditScoreAttestation, KYCAMLAttestation } from "../../types"
import { CREDIT_SCORE_ATTESTATION, getAttestionInformation, KYCAML_ATTESTATION, VERIFIABLE_CREDENTIAL } from "./attestation-registry"

export const CREDIT_SCORE_CREDENTIAL = "CreditScoreCredential"
export const KYCAML_ATTESTATION_CREDENTIAL = "KYCAMLCredential"

export const CREDIT_SCORE_ATTESTATION_MANIFEST_ID = "CreditScoreManifest"
export const KYCAML_ATTESTATION_MANIFEST_ID = "KYCAMLManifest"

export function getSampleKycAmlAttestation() : KYCAMLAttestation {
  const kycInfo = getAttestionInformation(KYCAML_ATTESTATION)
  return {
    type: kycInfo.type,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    process: kycInfo.process!,
    approvalDate: new Date().toISOString()
  }
}

export function getSampleCreditScoreAttestation(score: number) : CreditScoreAttestation {
  return {
    type: CREDIT_SCORE_ATTESTATION,
    score: score,
    scoreType: "Credit Score",
    provider: "Experian"
  }
}

export function attestationToCredentialType(attestationType: string): string[] {
  const types = [VERIFIABLE_CREDENTIAL]
  const result = typeMap.get(attestationType)
  if (result) {
    types.push(result)
  }
  return types
}

const typeMap = new Map<string, string>([
  [KYCAML_ATTESTATION, KYCAML_ATTESTATION_CREDENTIAL],
  [CREDIT_SCORE_ATTESTATION, CREDIT_SCORE_CREDENTIAL]
])
