import {
  CreditScoreAttestation,
  KYCAMLAttestation
} from "../../types/Attestations"

export const kycAmlAttestationFixture: KYCAMLAttestation = {
  "@type": "KYCAMLAttestation",
  process: "https://centre.io/schemas/kycaml/usa",
  authorityId: "did:web:verity.id",
  approvalDate: new Date().toJSON(),
  authorityName: "Verity",
  authorityUrl: "https://verity.id",
  authorityCallbackUrl: "https://identity.verity.id"
}

export const creditScoreAttestationFixture: CreditScoreAttestation = {
  "@type": "CreditScoreAttestation",
  score: 700,
  scoreType: "Credit Rating",
  provider: "Experian"
}
