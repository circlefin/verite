import { buildRequestCommon } from "../submission-requests"
import { CREDENTIAL_OFFER } from "../utils"

import type { CredentialManifest, CredentialOffer } from "../../types"

/**
 * Build a Credential Offer. It is a light-weight wrapper around the Credential
 * Manifest, including supplemental information for how to submit a subsequent
 * Credential Application.
 */
export function buildCredentialOffer(
  id: string,
  manifest: CredentialManifest,
  replyUrl: string
): CredentialOffer {
  const request = buildRequestCommon(
    id,
    CREDENTIAL_OFFER,
    manifest.issuer.id,
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
