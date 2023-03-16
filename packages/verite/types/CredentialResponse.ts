import { ContextType } from "."

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
  "@context": ContextType
  type: string | string[]
  verifiableCredential: JWT | JWT[]
  credential_response: CredentialResponse
}

// TOFIX: are we using this and below?
type NarrowCredentialResponseWrapper = {
  credential_response: CredentialResponse
}

export type EncodedCredentialResponseWrapper = JWT

export type DecodedCredentialResponseWrapper = NarrowCredentialResponseWrapper &
  Verifiable<W3CPresentation>
