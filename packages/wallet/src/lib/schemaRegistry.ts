import { last, compact } from "lodash"
import { asyncMap, OutputDescriptor, Verifiable, W3CCredential } from "verite"

import { CredentialAndDescriptor } from "../types"
import {
  getCredentials,
  getItemInList,
  getRevocationStatus,
  saveItemInList
} from "./storage"

export const getDescriptor = async (
  id: string
): Promise<OutputDescriptor | undefined> => {
  return getItemInList("schemas", id)
}

export const saveDescriptor = async (
  descriptor: OutputDescriptor,
  key: string
): Promise<void> => {
  return saveItemInList("schemas", descriptor, key)
}

export const findDescriptorForCredential = async (
  credential: Verifiable<W3CCredential>
): Promise<OutputDescriptor | undefined> => {
  const descriptors = await asyncMap<string, OutputDescriptor | undefined>(
    credential.type,
    async (type) => getDescriptor(type)
  )
  return last(compact(descriptors))
}

export const getCredentialsWithDescriptors = async (): Promise<
  CredentialAndDescriptor[]
> => {
  const creds = await getCredentials()
  const credentialAndDescriptor = await asyncMap<
    Verifiable<W3CCredential>,
    CredentialAndDescriptor | undefined
  >(creds, async (credential, index) => {
    const descriptor = await findDescriptorForCredential(credential)
    const revoked = await getRevocationStatus(credential)
    if (descriptor) {
      return {
        id: index.toString(), // unique id for FlatList
        credential,
        descriptor,
        revoked
      }
    }
  })

  return compact(credentialAndDescriptor)
}
