import { last, compact } from "lodash"
import { asyncMap, CredentialManifest, Verifiable, W3CCredential } from "verite"

import { CredentialAndManifest } from "../types"
import {
  getCredentials,
  getItemInList,
  getRevocationStatus,
  saveItemInList
} from "./storage"

export const getManifest = async (
  id: string
): Promise<CredentialManifest | undefined> => {
  return getItemInList("manifests", id)
}

export const saveManifest = async (
  manifest: CredentialManifest
): Promise<void> => {
  return saveItemInList("manifests", manifest, manifest.id)
}

export const findManifestForCredential = async (
  credential: Verifiable<W3CCredential>
): Promise<CredentialManifest | undefined> => {
  const manifests = await asyncMap<string, CredentialManifest | undefined>(
    credential.type,
    async (type) => getManifest(type)
  )
  return last(compact(manifests))
}

export const getCredentialsWithManifests = async (): Promise<
  CredentialAndManifest[]
> => {
  const creds = await getCredentials()
  const credentialAndManifest = await asyncMap<
    Verifiable<W3CCredential>,
    CredentialAndManifest | undefined
  >(creds, async (credential, index) => {
    const manifest = await findManifestForCredential(credential)
    const revoked = await getRevocationStatus(credential)
    if (manifest) {
      return {
        id: index.toString(), // unique id for FlatList
        credential,
        manifest,
        revoked
      }
    }
  })

  return compact(credentialAndManifest)
}
