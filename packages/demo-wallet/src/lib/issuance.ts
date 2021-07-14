import { Verifiable, W3CCredential } from "did-jwt-vc"
import { saveCredential } from "./storage"
import {
  DidKey,
  CredentialManifest,
  createCredentialApplication,
  decodeVerifiablePresentation
} from "./verity"

export const requestIssuance = async (
  url: string,
  did: DidKey,
  manifest: CredentialManifest
): Promise<Verifiable<W3CCredential> | undefined> => {
  const body = await createCredentialApplication(did, manifest)

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  })

  if (response.status === 200) {
    // Parse JSON
    const json = await response.json()

    // Decode the VP
    // TODO: It would be more correct to use the descriptor map for the `presentation` property
    const presentation = await decodeVerifiablePresentation(json.presentation)

    // Extract the issued VC
    // TODO: It would be more correct to use the descriptor map
    const credential =
      presentation.verifiablePresentation.verifiableCredential[0]

    // Persist the credential
    saveCredential(credential)

    return credential
  } else {
    console.log(response.status, await response.text())
  }
}
