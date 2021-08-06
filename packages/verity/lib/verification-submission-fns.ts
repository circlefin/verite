import {
  DecodedVerificationSubmission,
  EncodedVerificationSubmission
} from "../types"
import { decodeVerifiablePresentation } from "./utils/credentials"

/**
 * Decode an encoded Credential Application.
 *
 * A Credential Application contains an encoded Verifiable Presentation in it's
 * `presentation` field. This method decodes the Verifiable Presentation and
 * returns the decoded application.
 */
export async function decodeVerificationSubmission(
  verificationSubmission: EncodedVerificationSubmission
): Promise<DecodedVerificationSubmission> {
  const decodedPresentation = await decodeVerifiablePresentation(
    verificationSubmission.presentation
  )

  return {
    ...verificationSubmission,
    presentation: decodedPresentation
  }
}
