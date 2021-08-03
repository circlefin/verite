import fetch from "isomorphic-unfetch"
import type {
  ChallengeTokenUrlWrapper,
  CredentialManifest,
  ManifestWrapper,
  VerificationRequest,
  VerificationRequestWrapper
} from "../types"

/**
 * Build a wrapper containing a challenge token URL for use in a QR code.
 */
export function challengeTokenUrlWrapper(
  challengeTokenUrl: string,
  version = "1"
): ChallengeTokenUrlWrapper {
  return {
    challengeTokenUrl,
    version
  }
}

/**
 * Build a CredentialManifest wrapper, containing the manifest and
 * a callback URL
 */
export function manifestWrapper(
  manifest: CredentialManifest,
  callbackUrl: string
): ManifestWrapper {
  return {
    manifest,
    callbackUrl,
    version: "1",
    purpose: "offer"
  }
}

/**
 * Build a Verification Request wrapper
 */
export function verificationRequestWrapper(
  request: VerificationRequest
): VerificationRequestWrapper {
  return {
    request,
    version: "1",
    purpose: "request"
  }
}

/**
 * Hnandle QR codes that initiate an issuance or verification workflow.
 *
 * When scanning a QR code, it will encode a JSON object with a challengeTokenUrl
 * property. We will subsequently fetch that value to retrieve the full
 * manifest or verification request document.
 */
export async function handleScan(
  scanData: string
): Promise<ManifestWrapper | VerificationRequestWrapper | undefined> {
  const payload = json(scanData)

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
