import {
  DidKey,
  CredentialManifest,
  createCredentialApplication
} from "./verity"

export const requestIssuance = async (
  url: string,
  did: DidKey,
  manifest: CredentialManifest
): Promise<Response> => {
  const body = await createCredentialApplication(did, manifest)

  return await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  })
}
