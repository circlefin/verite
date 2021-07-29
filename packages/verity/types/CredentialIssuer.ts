import type { EntityStyle } from "./EntityStyle"

export type CredentialIssuer = {
  id: string
  name?: string
  styles?: EntityStyle
  comment?: string
}
