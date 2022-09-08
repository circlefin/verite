import { buildRequestCommon } from "../submission-requests"
import { CREDENTIAL_OFFER_TYPE_NAME } from "../utils"

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
    CREDENTIAL_OFFER_TYPE_NAME,
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
