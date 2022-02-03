import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Random from "expo-random"
import { DidKey, randomDidKey, Verifiable, W3CCredential } from "verite"

export const clear = async (): Promise<void> => {
  await AsyncStorage.clear()
}

export const getOrCreateDidKey = async (): Promise<DidKey> => {
  const did = await AsyncStorage.getItem("did")

  if (did) {
    const parseDid = JSON.parse(did)
    parseDid.privateKey = Uint8Array.from(Object.values(parseDid.privateKey))
    parseDid.publicKey = Uint8Array.from(Object.values(parseDid.publicKey))
    return parseDid
  }

  const newDid = randomDidKey(Random.getRandomBytes)

  await AsyncStorage.setItem("did", JSON.stringify(newDid))

  return newDid
}

export const getCredentials = async (): Promise<
  Verifiable<W3CCredential>[]
> => {
  const value = await AsyncStorage.getItem("credentials")
  if (value) {
    return JSON.parse(value)
  } else {
    return []
  }
}

export const saveCredential = async (
  credential: Verifiable<W3CCredential>
): Promise<void> => {
  const value = await AsyncStorage.getItem("credentials")
  let credentials
  if (value) {
    credentials = JSON.parse(value)
  } else {
    credentials = []
  }

  credentials.push(credential)

  return AsyncStorage.setItem("credentials", JSON.stringify(credentials))
}

export const deleteCredential = async (
  credential: Verifiable<W3CCredential>
): Promise<void> => {
  const value = await AsyncStorage.getItem("credentials")
  let credentials
  if (value) {
    credentials = JSON.parse(value)
  } else {
    credentials = []
  }

  const newList = credentials.filter((c: Verifiable<W3CCredential>) => {
    return credential.proof.jwt !== c.proof.jwt
  })

  return AsyncStorage.setItem("credentials", JSON.stringify(newList))
}

export const saveRevocationStatus = async (
  credential: Verifiable<W3CCredential>,
  value: boolean
): Promise<void> => {
  await saveItemInList("revoked", value, credential.proof.jwt)
}

export const getRevocationStatus = async (
  credential: Verifiable<W3CCredential>
): Promise<boolean> => {
  return (await getItemInList("revoked", credential.proof.jwt)) ?? false
}

/**
 * Generic function to persist a list of values
 */
export const saveItemInList = async <T>(
  key: string,
  value: T,
  valueKey: string
): Promise<void> => {
  const rawValue = await AsyncStorage.getItem(key)
  let list: Record<string, unknown> = {}
  if (rawValue) {
    list = JSON.parse(rawValue)
  }

  list[valueKey] = value

  await AsyncStorage.setItem(key, JSON.stringify(list))
}

/**
 * Generic function to retrieve a value from a list
 */
export const getItemInList = async <T>(
  key: string,
  valueKey: string
): Promise<T | undefined> => {
  const rawValue = await AsyncStorage.getItem(key)
  if (rawValue) {
    const list = JSON.parse(rawValue)
    return list[valueKey]
  }
}
