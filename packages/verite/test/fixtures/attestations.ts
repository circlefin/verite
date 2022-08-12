import {
  CreditScoreAttestation,
  ProcessApprovalAttestation
} from "../../types/Attestations"

//TODO
export const kycAmlAttestationFixture: ProcessApprovalAttestation = {
  type: "KYCAMLAttestation",
  process: "https://verite.id/definitions/processes/kycaml/0.0.1/usa",
  approvalDate: new Date().toJSON()
}

export const creditScoreAttestationFixture: CreditScoreAttestation = {
  type: "CreditScoreAttestation",
  score: 700,
  scoreType: "Credit Rating",
  provider: "Experian"
}
