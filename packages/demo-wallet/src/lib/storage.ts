import AsyncStorage from "@react-native-async-storage/async-storage"
import { random } from "./DidKey"

interface Did {
  id: string
  controller: string
  publicKey: Uint8Array
  privateKey: Uint8Array
}

export const getOrCreateDidKey = async (): Promise<Did> => {
  const did = await AsyncStorage.getItem("did")

  if (did) {
    return JSON.parse(did)
  }

  const newDid = random()

  await AsyncStorage.setItem("did", JSON.stringify(newDid))

  return newDid
}
