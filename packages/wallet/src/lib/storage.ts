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
  try {
  console.log("verite.storage.saveCredential 0")
  const value = await AsyncStorage.getItem("credentials")
  console.log("verite.storage.saveCredential 1")
  let credentials
  if (value) {
    console.log("verite.storage.saveCredential 2")
    credentials = JSON.parse(value)
  } else {
    console.log("verite.storage.saveCredential 3")
    credentials = []
  }
  console.log("verite.storage.saveCredential 4")
  credentials.push(credential)
  console.log("verite.storage.saveCredential 5")

  return AsyncStorage.setItem("credentials", JSON.stringify(credentials))
} catch (err) {
  console.error("verite.storage.saveCredential Erro2")
}
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
  console.log(`saveItemInList 1: key: ${key}, valueKey: ${valueKey}`)
  const rawValue = await AsyncStorage.getItem(key)
  console.log(`saveItemInList2`)
  let list: Record<string, unknown> = {}
  if (rawValue) {
    console.log(`saveItemInList 2`)
    list = JSON.parse(rawValue)
  }
  console.log(`saveItemInList 3`)
  list[valueKey] = value
  console.log(`saveItemInList4 ${value}`)
  await AsyncStorage.setItem(key, JSON.stringify(list))
}

/**
 * Generic function to retrieve a value from a list
 */
export const getItemInList = async <T>(
  key: string,
  valueKey: string
): Promise<T | undefined> => {
  console.log(`verite.storage.getItemInList 0: ${key}, ${valueKey}`)
  const rawValue = await AsyncStorage.getItem(key)
  console.log("verite.storage.getItemInList 2")
  if (rawValue) {
    console.log("verite.storage.getItemInList 3")
    const list = JSON.parse(rawValue)
    return list[valueKey]
  } else {
    console.log("verite.storage.getItemInList 4")
    console.log(AsyncStorage.getAllKeys)
  }
}
