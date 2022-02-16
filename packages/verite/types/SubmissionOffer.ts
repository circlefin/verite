/**
 * Base class for requests kicking off Credential Issuance and Presentation Exchange.
 * Additional notes on JWM format:
 * - namespaced `type` values in this implementation include:
 *    CredentialOffer | VerificationRequest
 * - implementors should consider using `from` and `reply_to` especially when these
 *   entities differ and additional application-specific validation should be performed.
 */
export type SubmissionOffer = {
  id: string
  type: string
  created_time: string
  expires_time: string
  reply_url: string
  from?: string
  reply_to?: [string]

  body: {
    challenge: string
    status_url?: string
  }
}
