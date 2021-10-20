import type { DescriptorMap } from "./DescriptorMap"
import type { Verifiable, W3CPresentation } from "./DidJwt"
import type { JWT } from "./Jwt"

type NarrowCredentialFulfillment = {
  credential_fulfillment: {
    id: string
    manifest_id: string
    descriptor_map: DescriptorMap[]
  }
  presentation: JWT
}

export type GenericCredentialFulfillment = NarrowCredentialFulfillment & {
  presentation: JWT | Verifiable<W3CPresentation>
}

export type EncodedCredentialFulfillment = NarrowCredentialFulfillment & {
  presentation: JWT
}
export type DecodedCredentialFulfillment = NarrowCredentialFulfillment & {
  presentation: Verifiable<W3CPresentation>
}
