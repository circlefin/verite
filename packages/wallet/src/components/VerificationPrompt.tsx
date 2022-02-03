import React from "react"
import { Text, View, StyleSheet } from "react-native"
import { VerificationOffer } from "verite"

import Card from "./Card"

const VerificationPrompt = ({
  verificationOffer,
  onCancel,
  onConfirm,
  isLoading
}: {
  verificationOffer: VerificationOffer
  onCancel: () => void
  onConfirm: () => void
  isLoading?: boolean
}): JSX.Element => {
  if (!verificationOffer) {
    return <Text>No verifiable presentation</Text>
  }

  const input =
    verificationOffer.body.presentation_definition.input_descriptors[0]

  return (
    <View style={styles.container}>
      <Card
        onCancel={onCancel}
        onConfirm={onConfirm}
        isLoading={isLoading}
        confirm="Pick Credential"
      >
        <View style={styles.body}>
          <Text style={styles.name}>{input.name}</Text>
          <Text style={styles.description}>{input.purpose}</Text>
        </View>
      </Card>
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
  body: {
    padding: 20,
    paddingBottom: 30
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
  }
})

export default VerificationPrompt
