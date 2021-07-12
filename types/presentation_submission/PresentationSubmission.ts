import { JWT } from "did-jwt-vc/lib/types"
import { ClaimFormatDesignation } from "../../lib/verity"
import { DescriptorMap } from "../shared/DescriptorMap"

export type CredentialApplicationWrapper = {
  credential_application: CredentialApplication
  presentation_submission?: PresentationSubmission
  presentation: JWT
  // {
  //   verifiableCredential: VerifiableCredentialSubmission[]
  //   holder: string
  //   proof: VerifiableCredentialProof
  // }
}

export type CredentialApplication = {
  id: string
  manifest_id: string
  format: ClaimFormatDesignation
}

export type PresentationSubmission = {
  id: string
  definition_id: string
  descriptor_map: DescriptorMap[]
}
