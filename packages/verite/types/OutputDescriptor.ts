// https://identity.foundation/credential-manifest/#output-descriptor

import type { DataDisplay } from "./DataDisplay"
import type { EntityStyle } from "./EntityStyle"
import type { Schema } from "./Schema"

export type OutputDescriptor = {
  id: string
  schema: Schema[]
  name?: string
  description?: string
  styles?: EntityStyle
  display?: DataDisplay
}
