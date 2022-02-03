import { saveCredential } from "./storage"
import {
  DidKey,
  CredentialManifest,
  buildCredentialApplication,
  decodeVerifiablePresentation,
  Verifiable,
  W3CCredential
} from "./verite"

export const requestIssuance = async (
  url: string,
  did: DidKey,
  manifest: CredentialManifest
): Promise<Verifiable<W3CCredential> | undefined> => {
  const body = await buildCredentialApplication(did, manifest)

  const response = await fetch(url, {
    method: "POST",
    body
  })

  if (response.status === 200) {
    // Parse JSON
    const text = await response.text()

    // Decode the VP
    const verifiablePresentation = await decodeVerifiablePresentation(text)

    // Extract the issued VC
    const credentials = verifiablePresentation.verifiableCredential ?? []

    // Persist the credential
    saveCredential(credentials[0])

    return credentials[0]
  } else {
    console.log(response.status, await response.text())
  }
}
