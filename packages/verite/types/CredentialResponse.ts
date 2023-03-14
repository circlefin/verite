import type { DescriptorMap } from "./DescriptorMap"
import type { Verifiable, W3CPresentation } from "./DidJwt"
import type { JWT } from "./Jwt"

export type CredentialResponse = {
  id: string
  manifest_id: string
  descriptor_map: DescriptorMap[]
}

export type CredentialResponseWrapper = {
  "@context": string | string[]
  type: string | string[]
  verifiableCredential: JWT | JWT[]
  credential_response: CredentialResponse
}

type NarrowCredentialFulfillment = {
  credential_response: CredentialResponse
}

export type EncodedCredentialFulfillment = JWT

export type DecodedCredentialFulfillment = NarrowCredentialFulfillment &
  Verifiable<W3CPresentation>
