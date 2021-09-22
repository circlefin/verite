import fetch from "isomorphic-unfetch"
import { v4 as uuidv4 } from "uuid"
import type {
  ChallengeTokenUrlWrapper,
  CredentialManifest,
  VerificationRequest,
  SubmissionRequest,
  CredentialOffer
} from "../types"
import {
  creditScorePresentationDefinition,
  kycPresentationDefinition
} from "./presentation-definitions"

const ONE_MONTH = 1000 * 60 * 60 * 24 * 30

/**
 * Build a wrapper containing a challenge token URL for use in a QR code.
 */
export function challengeTokenUrlWrapper(
  challengeTokenUrl: string
): ChallengeTokenUrlWrapper {
  return {
    challengeTokenUrl
  }
}

function buildRequestCommon(
  id: string,
  type: string,
  from: string,
  replyUrl: string,
  statusUrl?: string
): SubmissionRequest {
  const now = Date.now()
  const expires = now + ONE_MONTH

  const result = {
    id,
    type,
    from,
    created_time: now,
    expires_time: expires,
    reply_url: replyUrl,
    body: {
      status_url: statusUrl,
      challenge: uuidv4()
    }
  }
  return result
}

/**
 * Build a CredentialManifest wrapper, containing the manifest and
 * a callback URL
 */
export function manifestWrapper(
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

export function kycVerificationRequest(
  id: string,
  from: string,
  replyUrl: string,
  statusUrl?: string,
  trustedAuthorities: string[] = []
): VerificationRequest {
  const definition = kycPresentationDefinition(trustedAuthorities)
  const request = buildRequestCommon(
    id,
    "https://verity.id/types/VerificationRequest",
    from,
    replyUrl,
    statusUrl
  )

  return {
    ...request,
    body: {
      ...request.body,
      presentation_definition: definition
    }
  }
}

export function creditScoreVerificationRequest(
  id: string,
  from: string,
  replyUrl: string,
  statusUrl?: string,
  trustedAuthorities: string[] = [],
  minimumCreditScore?: number
): VerificationRequest {
  const definition = creditScorePresentationDefinition(
    trustedAuthorities,
    minimumCreditScore
  )

  const request = buildRequestCommon(
    id,
    "https://verity.id/types/VerificationRequest",
    from,
    replyUrl,
    statusUrl
  )

  return {
    ...request,
    body: {
      ...request.body,
      presentation_definition: definition
    }
  }
}

/**
 * Handle QR codes that initiate an issuance or verification workflow.
 *
 * When scanning a QR code, it will encode a JSON object with a challengeTokenUrl
 * property. We will subsequently fetch that value to retrieve the full
 * manifest or verification request document.
 */
export async function handleScan(
  scanData: string
): Promise<CredentialOffer | VerificationRequest | undefined> {
  const payload = json(scanData) as ChallengeTokenUrlWrapper

  if (!payload.challengeTokenUrl) {
    return
  }

  const response = await fetch(payload.challengeTokenUrl)
  return response.json()
}

function json(body: string | Record<string, unknown>): Record<string, unknown> {
  if (typeof body === "string") {
    try {
      return JSON.parse(body)
    } catch (e) {
      return {}
    }
  }

  return body
}
