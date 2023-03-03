import {
  DidKey,
  CredentialManifest,
  buildCredentialApplication,
  verifyVerifiablePresentation,
  Verifiable,
  W3CCredential,
  VerificationError
} from "verite"

import { saveDescriptor } from "./schemaRegistry"
import { saveCredential } from "./storage"
import { getValueOrLastArrayEntry } from "./utils"

export const requestIssuance = async (
  url: string,
  did: DidKey,
  manifest: CredentialManifest
): Promise<Verifiable<W3CCredential>[] | undefined> => {
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
      const verifiablePresentation = await verifyVerifiablePresentation(text)

      // Extract the issued VC
      const credentials = verifiablePresentation.verifiableCredential ?? []

      // Persist the credential and descriptor
      for (const [index, credential] of credentials.entries()) {
        const type = getValueOrLastArrayEntry(credential.type)
        await saveCredential({ ...credential, isRead: false })
        await saveDescriptor(manifest.output_descriptors[index], type)
      }

      return credentials
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
