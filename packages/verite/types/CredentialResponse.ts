import { MaybeRevocableCredential } from "./StatusList2021"

import type { DescriptorMap } from "./DescriptorMap"
import type { JWT } from "./Jwt"

export type CredentialResponse = {
  id: string
  spec_version: string
  manifest_id: string
  application_id?: string
  applicant: string
  fulfillment?: {
    descriptor_map: DescriptorMap[]
  }
  denial?: {
    reason: string
    input_descriptors: string[]
  }
}

export type CredentialResponseWrapper = {
  credential_response: CredentialResponse
  verifiableCredential?: JWT[]
}

// TOFIX: are we using this and below?
type NarrowCredentialResponseWrapper = {
  credential_response: CredentialResponse
}

export type EncodedCredentialResponseWrapper = JWT

export type DecodedCredentialResponseWrapper =
  NarrowCredentialResponseWrapper & {
    verifiableCredential?: MaybeRevocableCredential[] // TOFIX: union with other types?
  }
