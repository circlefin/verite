import { validateCredentialPayload } from "did-jwt-vc"
import { CredentialManifest } from "./verity"

/**
 * Hnandle QR codes that initiate issuance workflow.
 *
 * When scanning a QR code, it will encode a JSON object with a manifestUrl
 * property. We will subsequently fetch that value to retrieve the full
 * manifest document. Afterward, we request credentials from the given
 * submissionUrl.
 */
const handleManifest = async (
  payload
): Promise<{ manifest: CredentialManifest; submissionUrl: string }> => {
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
const handleVerification = async (payload): Promise<any> => {
  // Fetch the URL
  const url = payload.requestUrl
  const result = await fetch(url)

  // Parse the VerificationPresentationRequest
  const request = await result.json()

  // Extract the callbackUrl used to submit our VCs
  const callbackUrl = request.request.callback_url
  const presentation = request

  return {
    callbackUrl,
    presentation
  }
}

export const handleQrCode = async data => {
  const payload = JSON.parse(data)

  if (payload.manifestUrl) {
    return await handleManifest(payload)
  }

  if (payload.requestUrl) {
    return await handleVerification(payload)
  }
}
