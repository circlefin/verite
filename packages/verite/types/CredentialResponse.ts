import type { DescriptorMap } from "./DescriptorMap"
import type { Verifiable, W3CPresentation } from "./DidJwt"
import type { JWT } from "./Jwt"

export type CredentialResponse = {
  id: string
  manifest_id: string
  descriptor_map: DescriptorMap[]
}

type NarrowCredentialFulfillment = {
  credential_response: CredentialResponse
}

export type EncodedCredentialFulfillment = JWT

export type DecodedCredentialFulfillment = NarrowCredentialFulfillment &
  Verifiable<W3CPresentation>
