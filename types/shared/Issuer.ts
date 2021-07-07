import { EntityStyle } from "../credential_manifest/EntityStyle"

export type Issuer = {
  id: string
  name?: string
  styles?: EntityStyle
  comment?: string
}
