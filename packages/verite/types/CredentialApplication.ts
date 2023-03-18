import { MaybeRevocableCredential } from "./StatusList2021"

import type { ClaimFormatDesignation } from "./ClaimFormatDesignation"
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
  applicant: string
  presentation_submission?: PresentationSubmission
}

export type CredentialApplicationWrapper = {
  credential_application: CredentialApplication
  verifiableCredential?: JWT[]
}

export type EncodedCredentialApplicationWrapper = JWT

export type DecodedCredentialApplicationWrapper =
  NarrowCredentialApplication & {
    verifiableCredential?: MaybeRevocableCredential[] // TOFIX: Verifiable interface?
  }

export type GenericCredentialApplicationWrapper =
  | EncodedCredentialApplicationWrapper
  | DecodedCredentialApplicationWrapper
