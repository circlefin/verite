import { getAttestionInformation } from "../../lib/utils/attestation-registry"
import {
  CreditScoreAttestation,
  ProcessApprovalAttestation
} from "../../types/Attestations"

const kycInfo = getAttestionInformation("KYCAMLAttestation") //TODO
export const kycAmlAttestationFixture: ProcessApprovalAttestation = {
  type: kycInfo.type,
  process: kycInfo.process!,
  approvalDate: new Date().toJSON()
}

const creditScopeInfo = getAttestionInformation("CreditScoreAttestation") // TODO
export const creditScoreAttestationFixture: CreditScoreAttestation = {
  type: creditScopeInfo.type,
  score: 700,
  scoreType: "Credit Rating",
  provider: "Experian"
}
