import React from "react"
import { Button, Text, View, Image, StyleSheet } from "react-native"

const VerificationPrompt = ({
  presentation,
  onCancel,
  onConfirm
}: {
  presentation: any
  onCancel: () => void
  onConfirm: () => void
}): Element => {
  if (!presentation) {
    return <Text>No verifiable presentation</Text>
  }

  const input =
    presentation.presentation.presentation_definition.input_descriptors[0]

  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        // TODO: Using a placeholder until the sample server returns an actual asset.
        source={{ uri: "https://via.placeholder.com/150" }}
      />

      <Text style={styles.name}>{input.name}</Text>
      <Text style={styles.description}>{input.purpose}</Text>

      <View style={styles.buttons}>
        <Button onPress={onCancel} title="Cancel" />
        <Button onPress={onConfirm} title="OK" />
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

export default VerificationPrompt
