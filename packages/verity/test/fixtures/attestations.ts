import { KYCAMLAttestation, KYCAMLProvider } from "../../types/Attestations"

export const kycServiceProviderFixture: KYCAMLProvider = {
  "@type": "KYCAMLProvider",
  name: "Some Service",
  score: 200
}

export const kycAmlAttestationFixture: KYCAMLAttestation = {
  "@type": "KYCAMLAttestation",
  authorityId: "did:web:verity.id",
  approvalDate: new Date().toJSON(),
  authorityName: "Verity",
  authorityUrl: "https://verity.id",
  authorityCallbackUrl: "https://identity.verity.id",
  serviceProviders: [kycServiceProviderFixture]
}
