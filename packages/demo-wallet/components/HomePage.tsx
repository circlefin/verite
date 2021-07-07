import React from "react"
import { View, StyleSheet, Button, Alert } from "react-native"
import { CredentialManifest } from "../types"

export default function HomePage({ navigation }) {
  return (
    <View style={styles.container}>
      <Button
        title={"Scan QR Code"}
        onPress={() =>
          navigation.navigate("Scanner", {
            onScan: async ({ type, data }) => {
              // When scanning a QR code, it will encode a JSON object with a
              // manifestUrl property. We will subsequently fetch that value
              // to retrieve the full manifest document.

              // Parse manifest URL
              const manifestUrl = JSON.parse(data).manifestUrl

              // Fetch manifest URL
              const result = await fetch(manifestUrl)

              // Parse the manifest
              const manifest: CredentialManifest = await result.json()

              // Parse the styles
              const outputDescriptor = manifest.output_descriptors[0]
              const name = outputDescriptor?.name || "Request Credentials"
              const description = outputDescriptor?.description

              // Prompt user to request the credentials or cancel
              Alert.alert(name, description, [
                {
                  text: "Cancel",
                  style: "cancel"
                },
                {
                  text: "Request",
                  onPress: () => Alert.alert("Requesting VC")
                }
              ])
            }
          })
        }
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
