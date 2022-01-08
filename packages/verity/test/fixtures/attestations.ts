import {
  CreditScoreAttestation,
  KYCAMLAttestation
} from "../../types/Attestations"

export const kycAmlAttestationFixture: KYCAMLAttestation = {
  "@type": "KYCAMLAttestation",
  process: "https://demos.verity.id/schemas/definitions/1.0.0/kycaml/usa",
  approvalDate: new Date().toJSON()
}

export const creditScoreAttestationFixture: CreditScoreAttestation = {
  "@type": "CreditScoreAttestation",
  score: 700,
  scoreType: "Credit Rating",
  provider: "Experian"
}
