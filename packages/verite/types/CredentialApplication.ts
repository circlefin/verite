import { ContextType } from "./VerifiableCredential"

import type { ClaimFormatDesignation } from "./ClaimFormatDesignation"
import type { Verifiable, W3CPresentation } from "./DidJwt"
import type { JWT } from "./Jwt"
import type { PresentationSubmission } from "./PresentationSubmission"

type NarrowCredentialApplication = {
  credential_application: CredentialApplication
}

export type CredentialApplication = {
  id: string
  spec_version: string
  manifest_id: string
  format: ClaimFormatDesignation
  presentation_submission?: PresentationSubmission
}

// TODO: clarify how this is related to PresentationPayload
export type CredentialApplicationWrapper = {
  "@context": ContextType
  type: string | string[]
  credential_application: CredentialApplication
  verifiableCredential: JWT | JWT[]
}

export type GenericCredentialApplication =
  | EncodedCredentialApplication
  | DecodedCredentialApplication

export type EncodedCredentialApplication = JWT

export type DecodedCredentialApplication = NarrowCredentialApplication &
  Verifiable<W3CPresentation>
