// https://identity.foundation/credential-manifest/#general-composition

import { ClaimFormatDesignation } from "./ClaimFormatDesignation"
import { CredentialIssuer } from "./CredentialIssuer"
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
