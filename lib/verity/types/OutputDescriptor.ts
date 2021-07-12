// https://identity.foundation/credential-manifest/#output-descriptor

import { DataDisplay } from "./DataDisplay"
import { EntityStyle } from "./EntityStyle"
import { Schema } from "./Schema"

export type OutputDescriptor = {
  id: string
  schema: Schema[]
  name?: string
  description?: string
  styles?: EntityStyle | string
  display?: DataDisplay
}
