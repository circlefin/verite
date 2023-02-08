import {
  DidKey,
  CredentialManifest,
  buildCredentialApplication,
  decodeVerifiablePresentation,
  Verifiable,
  W3CCredential,
  VerificationError
} from "verite"

import { saveManifest } from "./manifestRegistry"
import { saveCredential } from "./storage"
import { getValueOrLastArrayEntry } from "./utils"

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

    try {
      // Decode the VP
      const verifiablePresentation = await decodeVerifiablePresentation(text)

      // Extract the issued VC
      const credentials = verifiablePresentation.verifiableCredential ?? []
      // Note that the Verite wallet currently assumes only 1 VC is in the
      // response, but the main Verite libraries can support more than one.
      // Feel free to submit a PR generalizing this.

      // // Persist the credential and manifest.
      // // Similar to the above assumptions, we're only using the last type in
      // // the VC type array

      const updatedCredentials = credentials.map((cred) => {
        const type = getValueOrLastArrayEntry(cred.type)
        saveCredential(cred)
        saveManifest(manifest, type)

        return { ...cred, isRead: false }
      })
      return updatedCredentials
    } catch (e) {
      const errorMessage = `Error requesting issuance, cause = ${
        (e as VerificationError).cause
      }`
      console.error(errorMessage)
      throw new Error(errorMessage)
    }
  } else {
    const errorMessage = `Unsuccessful response requesting issuance, status = ${
      response.status
    }, error text = ${await response.text()}
      (e as VerificationError).cause
    }`
    console.error(errorMessage)
    throw new Error(errorMessage)
  }
}
