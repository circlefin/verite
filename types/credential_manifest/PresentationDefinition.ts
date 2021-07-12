import { ClaimFormatDesignation } from "../shared/ClaimFormatDesignation"
import { InputDescriptor } from "./InputDescriptor"

// https://identity.foundation/presentation-exchange/#presentation-definition
export type PresentationDefinition = {
  id: string
  input_descriptors: InputDescriptor[]
  name?: string
  purpose?: string
  format?: ClaimFormatDesignation
}
