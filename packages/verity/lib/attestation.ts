import {
  CreditScoreAttestation,
  KYCAMLAttestation,
  KYCAMLProvider
} from "../types/Attestations"

// TODO(mv) allow custominzing the authority info
export function kycAmlAttestation(
  serviceProviders?: KYCAMLProvider[]
): KYCAMLAttestation {
  return {
    "@type": "KYCAMLAttestation",
    authorityId: "did:web:verity.id",
    approvalDate: new Date().toJSON(),
    authorityName: "Verity",
    authorityUrl: "https://verity.id",
    authorityCallbackUrl: "https://identity.verity.id",
    serviceProviders: serviceProviders
  }
}

export function creditScoreAttestation(score: number): CreditScoreAttestation {
  return {
    "@type": "CreditScoreAttestation",
    score,
    scoreType: "Credit Rating",
    provider: "Experian"
  }
}
