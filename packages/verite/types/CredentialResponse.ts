import type { DescriptorMap } from "./DescriptorMap"
import type { Verifiable, W3CPresentation } from "./DidJwt"
import type { JWT } from "./Jwt"

export type CredentialResponse = {
  id: string
  spec_version: string
  manifest_id: string
  application_id?: string
  fulfillment?: {
    descriptor_map: DescriptorMap[]
  }
  denial?: {
    reason: string
    input_descriptors: string[]
  }
}

export type CredentialResponseWrapper = {
  "@context": string | string[]
  type: string | string[]
  verifiableCredential: JWT | JWT[]
  credential_response: CredentialResponse
}

// TOFIX: consider renaming fulfillment here to avoid confusion
type NarrowCredentialFulfillment = {
  credential_response: CredentialResponse
}

export type EncodedCredentialFulfillment = JWT

export type DecodedCredentialFulfillment = NarrowCredentialFulfillment &
  Verifiable<W3CPresentation>
