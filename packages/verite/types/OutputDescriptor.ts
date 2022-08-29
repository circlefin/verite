// https://identity.foundation/credential-manifest/#output-descriptor

import type { DataDisplay } from "./DataDisplay"
import type { EntityStyle } from "./EntityStyle"

export type OutputDescriptor = {
  id: string
  schema: string
  name?: string
  description?: string
  styles?: EntityStyle
  display?: DataDisplay
}
