import { ContextType, LatestPresentationPayload } from "./VerifiableCredential"

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
  applicant?: string // TOFIX: make required and populate from holder when we finish CM / VP fixes
  presentation_submission?: PresentationSubmission
}

// TOFIX (response to next line): per latest CM spec, this is no longer a VP
// This means we should remove relationship to PresentationPayload and add back any needed fiends
// TOFIX: clarify how this is related to PresentationPayload
// this is a CredentialApplication VP embed!!!!
export type CredentialApplicationWrapper = LatestPresentationPayload & {
  "@context": ContextType
  //type: string | string[]
  credential_application: CredentialApplication
  //verifiableCredential: JWT | JWT[]
}

export type GenericCredentialApplication =
  | EncodedCredentialApplication
  | DecodedCredentialApplication

export type EncodedCredentialApplication = JWT

export type DecodedCredentialApplication = NarrowCredentialApplication &
  Verifiable<W3CPresentation>
