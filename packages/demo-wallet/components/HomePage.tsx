import React from "react"
import { View, StyleSheet, Button, Alert } from "react-native"
import { requestIssuance } from "../src/lib/issuance"
import { getOrCreateDidKey, saveCredential } from "../src/lib/storage"
import { DidKey, CredentialManifest } from "../src/lib/verity"

/**
 * When scanning a QR code, it will encode a JSON object with a manifestUrl
 * property. We will subsequently fetch that value to retrieve the full
 * manifest document. Afterward, we request credentials from the given
 * submissionUrl.
 */
const onScan = async ({ _type, data }) => {
  // Parse QR Code Data
  const payload = JSON.parse(data)
  const manifestUrl = payload.manifestUrl
  const submissionUrl = payload.submissionUrl

  // Fetch manifest URL
  const result = await fetch(manifestUrl)

  // Parse the manifest
  const manifest: CredentialManifest = await result.json()

  // Parse the styles
  const outputDescriptor = manifest.output_descriptors[0]
  const name = outputDescriptor?.name || "Request Credentials"
  const description = outputDescriptor?.description

  // Prompt user to request the credentials or cancel
  const did = await getOrCreateDidKey()
  await promptRequestIssuance(name, description, submissionUrl, did, manifest)
}

/**
 * Prompts user with an alert box to request a credential.
 *
 * @param title Title text of the Alert box.
 * @param description Body text in the Alert box.
 * @param did DID identifier
 * @param proof TBD
 */
const promptRequestIssuance = async (
  title: string,
  description: string | undefined,
  url: string,
  did: DidKey,
  manifest: CredentialManifest
) => {
  Alert.alert(title, description, [
    {
      text: "Cancel",
      style: "cancel"
    },
    {
      text: "Request",
      onPress: async () => {
        const response = await requestIssuance(url, did, manifest)
        const credential = await response.json()
        saveCredential(credential)
      }
    }
  ])
}

export default function HomePage({ navigation }) {
  return (
    <View style={styles.container}>
      <Button
        title={"Scan QR Code"}
        onPress={() => navigation.navigate("Scanner", { onScan })}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center"
  }
})
