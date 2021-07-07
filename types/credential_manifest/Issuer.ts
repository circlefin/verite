import { EntityStyle } from "./EntityStyle"

export type Issuer = {
  id: string
  name?: string
  styles?: EntityStyle
  comment?: string
}
