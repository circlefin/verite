import { JWT } from "did-jwt-vc/lib/types"
import { DescriptorMap } from "./DescriptorMap"

export type CredentialFulfillment = {
  credential_fulfillment: {
    id: string
    manifest_id: string
    descriptor_map: DescriptorMap[]
  }
  presentation: JWT
}
