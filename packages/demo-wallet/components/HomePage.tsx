import React, { useState } from "react"
import { Alert } from "react-native"
import { View, StyleSheet, Button, LogBox } from "react-native"
import CredentialManifestPrompt from "../src/components/CredentialManifestPrompt"
import { requestIssuance } from "../src/lib/issuance"
import { saveManifest } from "../src/lib/manifestRegistry"
import { getOrCreateDidKey } from "../src/lib/storage"
import { CredentialManifest } from "../src/lib/verity"

LogBox.ignoreLogs([
  "Non-serializable values were found in the navigation state"
])

export default function HomePage({ navigation }): Element {
  const [submissionUrl, setSubmissionUrl] = useState<string>()
  const [manifest, setManifest] = useState<CredentialManifest | null>()

  /**
   * When scanning a QR code, it will encode a JSON object with a manifestUrl
   * property. We will subsequently fetch that value to retrieve the full
   * manifest document. Afterward, we request credentials from the given
   * submissionUrl.
   */
  const onScan = async ({ _type, data }) => {
    // Parse QR Code Data
    const payload = JSON.parse(data)

    // We must request the credentials from the submissionUrl
    setSubmissionUrl(payload.submissionUrl)

    // Fetch manifest URL
    const manifestUrl = payload.manifestUrl
    const result = await fetch(manifestUrl)

    // Parse the manifest
    const manifest: CredentialManifest = await result.json()

    // Persist the manifest to the device
    await saveManifest(manifest)
    setManifest(manifest)
  }

  const onCancel = () => {
    setManifest(null)
  }

  const onConfirm = async () => {
    if (!submissionUrl || !manifest) {
      return
    }
    const did = await getOrCreateDidKey()
    const credential = await requestIssuance(submissionUrl, did, manifest)

    if (credential) {
      navigation.navigate("Credentials", {
        screen: "Details",
        params: {
          credential: credential
        }
      })
    } else {
      Alert.alert("Error", "Something went wrong.")
    }
  }

  return (
    <View style={styles.container}>
      {manifest ? (
        <CredentialManifestPrompt
          credentialManifest={manifest}
          onCancel={onCancel}
          onConfirm={onConfirm}
        />
      ) : (
        <Button
          title={"Scan QR Code"}
          onPress={() => navigation.navigate("Scanner", { onScan })}
        />
      )}
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
