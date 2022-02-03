import type { ClaimFormatDesignation } from "./ClaimFormatDesignation"
import type { InputDescriptor } from "./InputDescriptor"

// https://identity.foundation/presentation-exchange/#presentation-definition
export type PresentationDefinition = {
  id: string
  input_descriptors: InputDescriptor[]
  name?: string
  purpose?: string
  format?: ClaimFormatDesignation
}
