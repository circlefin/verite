// https://identity.foundation/credential-manifest/#general-composition

import { CredentialIssuer, ClaimFormatDesignation } from ".."
import { OutputDescriptor } from "./OutputDescriptor"
import { PresentationDefinition } from "./PresentationDefinition"

export type CredentialManifest = {
  id: string
  version: string
  issuer: CredentialIssuer
  output_descriptors: OutputDescriptor[]
  format?: ClaimFormatDesignation
  presentation_definition?: PresentationDefinition
}
