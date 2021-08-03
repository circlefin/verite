import type { ClaimFormatDesignation } from "./ClaimFormatDesignation"
import type { JWT } from "./Jwt"
import type { PresentationSubmission } from "./PresentationSubmission"
import type { Verifiable, W3CPresentation } from "./W3C"

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
