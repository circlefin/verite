// https://identity.foundation/credential-manifest/#general-composition

import type { ClaimFormatDesignation } from "./ClaimFormatDesignation"
import type { CredentialIssuer } from "./CredentialIssuer"
import type { OutputDescriptor } from "./OutputDescriptor"
import type { PresentationDefinition } from "./PresentationDefinition"

export type CredentialManifest = {
  id: string
  spec_version: string
  issuer: CredentialIssuer
  output_descriptors: OutputDescriptor[]
  format?: ClaimFormatDesignation
  presentation_definition?: PresentationDefinition
}
