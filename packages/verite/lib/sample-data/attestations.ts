import {
  CredentialSchema,
  CreditScoreAttestation,
  KYCAMLAttestation
} from "../../types"
import {
  AttestationDefinition,
  CREDIT_SCORE_ATTESTATION,
  getAttestionDefinition,
  KYCAML_ATTESTATION
} from "../utils/attestation-registry"
import { VERIFIABLE_CREDENTIAL_TYPE_NAME } from "../utils/constants"
import {
  CREDIT_SCORE_CREDENTIAL_TYPE_NAME,
  KYCAML_CREDENTIAL_TYPE_NAME
} from "./constants"

export function getSampleKycAmlAttestation(): KYCAMLAttestation {
  const kycInfo = getAttestionDefinition(KYCAML_ATTESTATION)
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

export function getCredentialSchemaAsVCObject(
  attestationDefinition: AttestationDefinition
): CredentialSchema {
  return {
    id: attestationDefinition.schema,
    type: attestationDefinition.type
  }
}
