import AsyncStorage from "@react-native-async-storage/async-storage"
import { randomDidKey } from "./verity"

interface Did {
  id: string
  controller: string
  publicKey: Uint8Array
  privateKey: Uint8Array
}

export const getOrCreateDidKey = async (): Promise<Did> => {
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
