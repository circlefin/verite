import fetch from "isomorphic-unfetch"
import type { CredentialManifest, VerificationRequest } from "../types"

export type ManifestUrlWrapper = {
  manifestUrl: string
  submissionUrl: string
  version: string
}

export type VerificationRequestWrapper = {
  requestUrl: string
  version: string
}

type ManifestQrData = {
  manifest: CredentialManifest
  submissionUrl: string
}

type VerificationQrData = {
  verificationRequest: VerificationRequest
}

export function scanDataForManifest(
  manifestUrl: string,
  submissionUrl: string,
  version = "1"
): ManifestUrlWrapper {
  return {
    manifestUrl,
    submissionUrl,
    version
  }
}

export function scanDataForVerification(
  requestUrl: string,
  version = "1"
): VerificationRequestWrapper {
  return {
    requestUrl,
    version
  }
}

export function handleScan(
  scanData: string
): Promise<ManifestQrData> | Promise<VerificationQrData> | undefined {
  const payload = json(scanData)

  if (payload.manifestUrl) {
    return handleManifest(payload as ManifestUrlWrapper)
  }

  if (payload.requestUrl) {
    return handleVerification(payload as VerificationRequestWrapper)
  }
}

/**
 * Hnandle QR codes that initiate issuance workflow.
 *
 * When scanning a QR code, it will encode a JSON object with a manifestUrl
 * property. We will subsequently fetch that value to retrieve the full
 * manifest document. Afterward, we request credentials from the given
 * submissionUrl.
 */
const handleManifest = async (
  payload: ManifestUrlWrapper
): Promise<ManifestQrData> => {
  // Fetch manifest URL
  const manifestUrl = payload.manifestUrl
  const result = await fetch(manifestUrl)

  // Parse the manifest
  const manifest: CredentialManifest = await result.json()

  // We must request the credentials from the submissionUrl
  const submissionUrl = payload.submissionUrl

  return {
    manifest,
    submissionUrl
  }
}

/**
 * When a user scans a verification QR code, we will prompt the user to select a VC as input
 */
const handleVerification = async (
  payload: VerificationRequestWrapper
): Promise<VerificationQrData> => {
  // Fetch the URL
  const url = payload.requestUrl
  const result = await fetch(url)

  // Parse the VerificationPresentationRequest
  const verificationRequest: VerificationRequest = await result.json()

  return {
    verificationRequest
  }
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
