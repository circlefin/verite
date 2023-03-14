import {
  AttestationTypes,
  CreditScoreAttestation,
  ProcessApprovalAttestation
} from "../../types"
import { getAttestionDefinition } from "../utils/attestation-registry"

export function buildProcessApprovalAttestation(
  attestationType: AttestationTypes
): ProcessApprovalAttestation {
  const ad = getAttestionDefinition(attestationType)
    .attestation as ProcessApprovalAttestation
  return {
    type: ad.type,
    process: ad.process,
    approvalDate: new Date().toISOString()
  }
}

export function buildSampleCreditScoreAttestation(
  score: number
): CreditScoreAttestation {
  return {
    type: AttestationTypes.CreditScoreAttestation,
    score: score,
    scoreType: "Credit Score",
    provider: "Experian"
  }
}
