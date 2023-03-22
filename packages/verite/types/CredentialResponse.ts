import type { DescriptorMap } from "./DescriptorMap"

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

export type CredentialResponseWrapper<T> = {
  credential_response: CredentialResponse
  verifiableCredential?: T[]
}
