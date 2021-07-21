import AsyncStorage from "@react-native-async-storage/async-storage"
import { DidKey, randomDidKey } from "./verity"

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

  const newDid = randomDidKey()

  await AsyncStorage.setItem("did", JSON.stringify(newDid))

  return newDid
}

export const getCredentials = async (): Promise<any> => {
  const value = await AsyncStorage.getItem("credentials")
  if (value) {
    return JSON.parse(value)
  } else {
    return []
  }
}

export const saveCredential = async (credential: any): Promise<any> => {
  const value = await AsyncStorage.getItem("credentials")
  let credentials
  if (value) {
    credentials = JSON.parse(value)
  } else {
    credentials = []
  }

  credentials.push(credential)

  await AsyncStorage.setItem("credentials", JSON.stringify(credentials))
}

/**
 * Generic function to persist a list of values
 */
export const saveItemInList = async (
  key: string,
  value: any,
  valueKey: string
): Promise<void> => {
  const rawValue = await AsyncStorage.getItem(key)
  let list = {}
  if (rawValue) {
    list = JSON.parse(rawValue)
  }

  list[valueKey] = value

  await AsyncStorage.setItem(key, JSON.stringify(list))
}

/**
 * Generic function to retrieve a value from a list
 */
export const getItemInList = async (
  key: string,
  valueKey: string
): Promise<any> => {
  const rawValue = await AsyncStorage.getItem(key)
  if (rawValue) {
    const list = JSON.parse(rawValue)
    return list[valueKey]
  }
}
