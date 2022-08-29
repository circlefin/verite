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
  console.log(`getManifest ${id}`)
  return getItemInList("manifests", id)
}

export const saveManifest = async (
  manifest: CredentialManifest
): Promise<void> => {
  console.log(`saveManifest ${manifest.id}`)
  return saveItemInList("manifests", manifest, manifest.id)
}

export const findManifestForCredential = async (
  credential: Verifiable<W3CCredential>
): Promise<CredentialManifest | undefined> => {
  console.log(`findManifestForCredential: ${credential.type}`)
  const manifests = await asyncMap<string, CredentialManifest | undefined>(
    credential.type,
    async (type) => getManifest(type)
  )
  return last(compact(manifests))
}

export const getCredentialsWithManifests = async (): Promise<
  CredentialAndManifest[]
> => {
  try {
    console.log("getCredentialsWithManifests 1")
  const creds = await getCredentials()
  console.log("getCredentialsWithManifests 2")
  const credentialAndManifest = await asyncMap<
    Verifiable<W3CCredential>,
    CredentialAndManifest | undefined
  >(creds, async (credential, index) => {
    console.log("getCredentialsWithManifests 3")
    const manifest = await findManifestForCredential(credential)
    console.log("getCredentialsWithManifests 4")
    const revoked = await getRevocationStatus(credential)
    console.log("getCredentialsWithManifests 5")
    if (manifest) {
      console.log("getCredentialsWithManifests 6")
      return {
        id: index.toString(), // unique id for FlatList
        credential,
        manifest,
        revoked
      }
    }
    console.log("getCredentialsWithManifests 7")
  })


  return compact(credentialAndManifest)
} catch(err) {
  console.log("getCredentialsWithManifests 8 ERROR!")
  console.error(err)
  throw err
}
}
