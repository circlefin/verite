import { Issuer } from "types/shared/Issuer"

export type ServiceProvider = {
  name?: string
  score?: number
  completionDate?: string
  comment?: string
}

export type CredentialSubject = {
  id: string
  KYCAMLAttestation?: {
    authorityId: string
    approvalDate: string
    expirationDate?: string
    authorityName?: string
    authorityUrl?: string
    authorityCallbackUrl?: string
    serviceProviders?: ServiceProvider[]
  }
}

export type VerifiableCredentialProof = {
  type: string
  created: string
  jws: string
  proofPurpose: string
  verificationMethod: string
  challenge?: string
}

export type VerifiableCredential = {
  "@context": string[]
  type: string[]
  issuer: Issuer
  issuanceDate: string
  credentialSubject: CredentialSubject
  proof: VerifiableCredentialProof
}

export type VerifiableCredentialSubmission = {
  "@context": string[]
  type: string[]
  credentialSubject: CredentialSubject
}

export type VerifiablePresentation = {
  id: string
  credential: VerifiableCredential
}
