import {
  getSampleCreditScoreAttestation,
  getSampleKycAmlAttestation
} from "../../lib/sample-data"
import { getAttestionDefinition, KYCAML_ATTESTATION } from "../../lib/utils"
import {
  CreditScoreAttestation,
  KYCAMLAttestation
} from "../../types/Attestations"

export const KYC_ATTESTATION_SCHEMA_URI =
  getAttestionDefinition(KYCAML_ATTESTATION).schema

export const kycAmlAttestationFixture: KYCAMLAttestation =
  getSampleKycAmlAttestation()

export const creditScoreAttestationFixture: CreditScoreAttestation =
  getSampleCreditScoreAttestation(700)
