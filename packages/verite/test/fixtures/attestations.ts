import { getSampleKycAmlAttestation, getSampleCreditScoreAttestation } from "../../lib/utils"
import {
  CreditScoreAttestation,
  KYCAMLAttestation
} from "../../types/Attestations"

export const kycAmlAttestationFixture: KYCAMLAttestation = getSampleKycAmlAttestation()

export const creditScoreAttestationFixture: CreditScoreAttestation = getSampleCreditScoreAttestation(700)