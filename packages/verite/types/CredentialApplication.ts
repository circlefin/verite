import type { ClaimFormatDesignation } from "./ClaimFormatDesignation"
import type { Verifiable, W3CPresentation } from "./DidJwt"
import type { JWT } from "./Jwt"
import type { PresentationSubmission } from "./PresentationSubmission"

type NarrowCredentialApplication = {
  credential_application: CredentialApplicationHeader
}

export type CredentialApplicationHeader = {
  id: string
  manifest_id: string
  format: ClaimFormatDesignation
  presentation_submission?: PresentationSubmission
}

export type GenericCredentialApplication =
  | EncodedCredentialApplication
  | DecodedCredentialApplication

export type EncodedCredentialApplication = JWT

export type DecodedCredentialApplication = NarrowCredentialApplication &
  Verifiable<W3CPresentation>
