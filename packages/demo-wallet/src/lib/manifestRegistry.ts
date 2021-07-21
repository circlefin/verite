import { getItemInList, saveItemInList } from "./storage"
import { CredentialManifest } from "./verity"

export const getManifest = async (id: string): Promise<CredentialManifest> => {
  return await getItemInList("manifests", id)
}

export const saveManifest = async (
  manifest: CredentialManifest
): Promise<void> => {
  return await saveItemInList("manifests", manifest, manifest.id)
}
