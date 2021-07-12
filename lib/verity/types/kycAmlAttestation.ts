import { KYCAMLProvider } from "./kycAmlProvider"

export type KYCAMLAttestation = {
  "@type": "KYCAMLAttestation"
  authorityId: string
  approvalDate: string
  expirationDate?: string
  authorityName?: string
  authorityUrl?: string
  authorityCallbackUrl?: string
  serviceProviders?: KYCAMLProvider[]
}
