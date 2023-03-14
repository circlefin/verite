import {
  buildSampleCreditScoreAttestation,
  buildProcessApprovalAttestation
} from "../../lib/sample-data"
import {
  AttestationTypes,
  CreditScoreAttestation,
  KYCAMLAttestation
} from "../../types/Attestations"

export const kycAmlAttestationFixture: KYCAMLAttestation =
  buildProcessApprovalAttestation(AttestationTypes.KYCAMLAttestation)

export const creditScoreAttestationFixture: CreditScoreAttestation =
  buildSampleCreditScoreAttestation(700)
