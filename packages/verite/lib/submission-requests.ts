import fetch from "cross-fetch"
import { isString } from "lodash"
import { v4 as uuidv4 } from "uuid"

import type {
  ChallengeTokenUrlWrapper,
  VerificationOffer,
  SubmissionOffer,
  CredentialOffer
} from "../types"

const ONE_MONTH = 1000 * 60 * 60 * 24 * 30

/**
 * This file contains a set of functions to help interact with mobile wallets.
 * You can use any method of communication, but for the demo we decided to
 * have the mobile wallet scan a QR code.
 *
 * QR codes get more complex as you put more data in them. Consequently, the
 * QR code will encode a simple object with a `challengeTokenUrl` property that
 * references a URL. The client will scan the QR code and then follow the URL
 * provided.
 *
 * After following the URL, the client will receive a payload resembling the
 * schema as defined by the WACI protcol. https://identity.foundation/waci-presentation-exchange/#json-message
 * The actual data we wish to communicate to the client will be found in the
 * body property of the response. For example, it might contain the Credential
 * Manifest, a Presentation Request, a status URL for checking a verification,
 * or the challenge string necessary for signing presentations.
 *
 * Most importantly, we have made some modifications, such as adding a
 * `replyUrl` to instruct the client where to submit their credential
 * application.
 */

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

export function buildRequestCommon(
  id: string,
  type: string,
  from: string,
  replyUrl: string,
  statusUrl?: string
): SubmissionOffer {
  const now = Date.now()
  const expires = now + ONE_MONTH

  const result = {
    id,
    type,
    from,
    created_time: new Date(now).toISOString(),
    expires_time: new Date(expires).toISOString(),
    reply_url: replyUrl,
    body: {
      status_url: statusUrl,
      challenge: uuidv4()
    }
  }
  return result
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
): Promise<CredentialOffer | VerificationOffer | undefined> {
  const payload = json(scanData) as ChallengeTokenUrlWrapper

  if (!payload.challengeTokenUrl) {
    return
  }

  const response = await fetch(payload.challengeTokenUrl)
  return response.json()
}

function json(body: string | Record<string, unknown>): Record<string, unknown> {
  if (isString(body)) {
    try {
      return JSON.parse(body)
    } catch (e) {
      return {}
    }
  }

  return body
}
