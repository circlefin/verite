import { JWT } from "did-jwt-vc/lib/types"
import { DescriptorMap } from "../../lib/verity"

export type CredentialFulfillment = {
  id: string
  manifest_id: string
  descriptor_map: DescriptorMap[]
}

export type CredentialFulfillmentResponse = {
  credential_fulfillment: CredentialFulfillment
  presentation: JWT
}
