import React from "react"
import { Button, Text, View, Image, StyleSheet } from "react-native"
import { CredentialManifest } from "../lib/verity"

const CredentialManifestPrompt = ({
  credentialManifest,
  onCancel,
  onConfirm
}: {
  credentialManifest: CredentialManifest
  onCancel: () => void
  onConfirm: () => void
}): Element => {
  console.log(credentialManifest)

  if (!credentialManifest) {
    return <Text>No Credential Manifest</Text>
  }

  // TODO: Do we need to make this more flexible to support multiple outputs? It seems unnecessary
  const od = credentialManifest.output_descriptors[0]

  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        // TODO: Using a placeholder until the sample server returns an actual asset.
        source={{ uri: "https://via.placeholder.com/150" }}
      />

      <Text style={styles.name}>{od.name}</Text>
      <Text style={styles.description}>{od.description}</Text>

      <View style={styles.buttons}>
        <Button onPress={onCancel} title="Cancel" />
        <Button onPress={onConfirm} title="Request" />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: 8
  },
  logo: {
    width: 150,
    height: 150,
    margin: 16,
    borderRadius: 8
  },
  name: {
    fontWeight: "600",
    fontSize: 20,
    textAlign: "center",
    marginBottom: 8
  },
  description: {
    fontSize: 16,
    fontWeight: "400",
    textAlign: "center"
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between"
  }
})

export default CredentialManifestPrompt
