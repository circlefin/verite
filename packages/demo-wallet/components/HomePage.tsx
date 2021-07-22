import React, { useState } from "react"
import { Alert } from "react-native"
import { View, StyleSheet, Button, LogBox } from "react-native"
import CredentialManifestPrompt from "../src/components/CredentialManifestPrompt"
import VerificationPrompt from "../src/components/VerificationPrompt"
import { requestIssuance } from "../src/lib/issuance"
import { saveManifest } from "../src/lib/manifestRegistry"
import { getOrCreateDidKey } from "../src/lib/storage"
import { CredentialManifest } from "../src/lib/verity"
import { handleQrCode } from "../src/lib/waci"

LogBox.ignoreLogs([
  "Non-serializable values were found in the navigation state"
])

export default function HomePage({ navigation }): Element {
  const [submissionUrl, setSubmissionUrl] = useState<string>()
  const [manifest, setManifest] = useState<CredentialManifest | null>()
  const [presentation, setPresentation] = useState()

  const onScan = async ({ _type, data }) => {
    const response = await handleQrCode(data)

    // In a perfect world, we would use the input descriptors to prompt the
    // user and ultimately satisfy either workflow, but for now we'll use
    // different code paths.

    // Issuance
    if (response.manifest) {
      const { manifest, submissionUrl } = response
      // Persist manifest to disk
      await saveManifest(manifest)

      setSubmissionUrl(submissionUrl)
      setManifest(manifest)
    }

    // Verification
    if (response.callbackUrl) {
      setPresentation(response)
    }
  }

  const onCancel = () => {
    setManifest(null)
    setPresentation(null)
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
      setManifest(null)
    } else {
      Alert.alert("Error", "Something went wrong.")
    }
  }

  const onVerificationConfirm = presentation => {
    navigation.navigate("CredentialPicker", { payload: presentation })
    setPresentation(null)
  }

  return (
    <View style={styles.container}>
      {manifest ? (
        <CredentialManifestPrompt
          credentialManifest={manifest}
          onCancel={onCancel}
          onConfirm={onConfirm}
        />
      ) : null}

      {presentation ? (
        <VerificationPrompt
          presentation={presentation}
          onCancel={onCancel}
          onConfirm={() => onVerificationConfirm(presentation)}
        />
      ) : null}

      {!manifest && !presentation ? (
        <Button
          title={"Scan QR Code"}
          onPress={() => navigation.navigate("Scanner", { onScan })}
        />
      ) : null}
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
