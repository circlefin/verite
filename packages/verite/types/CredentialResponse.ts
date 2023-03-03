import type { DescriptorMap } from "./DescriptorMap"
import type { Verifiable, W3CPresentation } from "./DidJwt"
import type { JWT } from "./Jwt"

type NarrowCredentialFulfillment = {
  credential_response: {
    id: string
    manifest_id: string
    descriptor_map: DescriptorMap[]
  }
}

export type EncodedCredentialFulfillment = JWT

export type DecodedCredentialFulfillment = NarrowCredentialFulfillment &
  Verifiable<W3CPresentation>
