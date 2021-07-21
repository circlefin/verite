import { DescriptorMap } from "./DescriptorMap"
import { JWT } from "./Jwt"

export type CredentialFulfillment = {
  credential_fulfillment: {
    id: string
    manifest_id: string
    descriptor_map: DescriptorMap[]
  }
  presentation: JWT
}
