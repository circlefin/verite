import {
  Attestation,
  buildProcessApprovalAttestation,
  buildSampleCreditScoreAttestation,
  AttestationTypes
} from "verite"

import type { User } from "../database"

export function buildAttestationForUser(
  user: User,
  attestationType: AttestationTypes
): Attestation {
  // TOFIX: generalize this
  if (attestationType === AttestationTypes.CreditScoreAttestation) {
    return buildSampleCreditScoreAttestation(user.creditScore)
  } else {
    return buildProcessApprovalAttestation(attestationType)
  }
}
