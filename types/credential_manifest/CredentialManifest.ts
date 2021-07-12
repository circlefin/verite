// https://identity.foundation/credential-manifest/#general-composition

import { ClaimFormatDesignation } from "../shared/ClaimFormatDesignation"
import { Issuer } from "../shared/Issuer"
import { OutputDescriptor } from "./OutputDescriptor"
import { PresentationDefinition } from "./PresentationDefinition"

export type CredentialManifest = {
  id: string
  version: string
  issuer: Issuer
  output_descriptors: OutputDescriptor[]
  format?: ClaimFormatDesignation
  presentation_definition?: PresentationDefinition
}
