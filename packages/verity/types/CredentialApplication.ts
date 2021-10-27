import type { ClaimFormatDesignation } from "./ClaimFormatDesignation"
import type { Verifiable, W3CPresentation } from "./DidJwt"
import type { JWT } from "./Jwt"
import type { PresentationSubmission } from "./PresentationSubmission"

type NarrowCredentialApplication = {
  credential_application: CredentialApplicationHeader
  presentation_submission?: PresentationSubmission
}

export type CredentialApplicationHeader = {
  id: string
  manifest_id: string
  format: ClaimFormatDesignation
}

export type GenericCredentialApplication = NarrowCredentialApplication & {
  presentation: JWT | Verifiable<W3CPresentation>
}

export type EncodedCredentialApplication = NarrowCredentialApplication & {
  presentation: JWT
}
export type DecodedCredentialApplication = NarrowCredentialApplication & {
  presentation: Verifiable<W3CPresentation>
}
