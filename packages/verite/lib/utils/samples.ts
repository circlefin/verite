import { CreditScoreAttestation, KYCAMLAttestation } from "../../types"
import { getAttestionInformation } from "./attestation-registry"
import {
  CREDIT_SCORE_ATTESTATION,
  CREDIT_SCORE_CREDENTIAL_TYPE_NAME,
  KYCAML_ATTESTATION,
  KYCAML_CREDENTIAL_TYPE_NAME,
  VERIFIABLE_CREDENTIAL_TYPE_NAME
} from "./constants"

export function getSampleKycAmlAttestation(): KYCAMLAttestation {
  const kycInfo = getAttestionInformation(KYCAML_ATTESTATION)
  return {
    type: kycInfo.type,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    process: kycInfo.process!,
    approvalDate: new Date().toISOString()
  }
}

export function getSampleCreditScoreAttestation(
  score: number
): CreditScoreAttestation {
  return {
    type: CREDIT_SCORE_ATTESTATION,
    score: score,
    scoreType: "Credit Score",
    provider: "Experian"
  }
}

export function attestationToCredentialType(attestationType: string): string[] {
  const types = [VERIFIABLE_CREDENTIAL_TYPE_NAME]
  const result = typeMap.get(attestationType)
  if (result) {
    types.push(result)
  }
  return types
}

const typeMap = new Map<string, string>([
  [KYCAML_ATTESTATION, KYCAML_CREDENTIAL_TYPE_NAME],
  [CREDIT_SCORE_ATTESTATION, CREDIT_SCORE_CREDENTIAL_TYPE_NAME]
])