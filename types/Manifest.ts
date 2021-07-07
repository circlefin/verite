// https://identity.foundation/credential-manifest/#general-composition

import { ClaimFormatDesignation } from "./ClaimFormatDesignation"
import { Issuer } from "./Issuer"
import { OutputDescriptor } from "./OutputDescriptor"
import { PresentationDefinition } from "./PresentationDefinition"

export type Manifest = {
  id: string
  version: string
  issuer: Issuer
  output_descriptors: OutputDescriptor[]
  format?: ClaimFormatDesignation
  presentation_definition?: PresentationDefinition
}

export type ManifestUrlObject = {
  manifestUrl: string
  version: string
}
