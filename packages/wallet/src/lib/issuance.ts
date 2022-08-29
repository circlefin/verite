import {
  DidKey,
  CredentialManifest,
  buildCredentialApplication,
  decodeVerifiablePresentation,
  Verifiable,
  W3CCredential,
  VerificationError
} from "verite"

import { saveCredential } from "./storage"

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
      console.log("verite.issuance.requestIssuance 0")
      const verifiablePresentation = await decodeVerifiablePresentation(text)

      // Extract the issued VC
      const credentials = verifiablePresentation.verifiableCredential ?? []

      console.log("verite.issuance.requestIssuance 1")

      // Persist the credential
      // TODO
      saveCredential(credentials[0])
      console.log("verite.issuance.requestIssuance 2")
      return credentials[0]
    } catch (e) {
      console.error("verite.issuance.requestIssuance error!!!")
      console.error((e as VerificationError).cause)
    }
  } else {
    console.log(response.status, await response.text())
  }
}
