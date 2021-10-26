import type { CredentialManifest, CredentialOffer } from "../../types"
import { buildRequestCommon } from "../submission-requests"

/**
 * Build a Credential Offer. It is a light-weight wrapper around the Credential
 * Manifest, including supplemental information for how to submit a subsequent
 * Credential Application.
 */
export function buildCredentialOffer(
  id: string,
  manifest: CredentialManifest,
  from: string,
  replyUrl: string
): CredentialOffer {
  const request = buildRequestCommon(
    id,
    "https://verity.id/types/CredentialOffer",
    from,
    replyUrl
  )

  return {
    ...request,
    body: {
      ...request.body,
      manifest: manifest
    }
  }
}
