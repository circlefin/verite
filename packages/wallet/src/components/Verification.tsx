import React, { useEffect, useState } from "react"
import { ActivityIndicator, View, StyleSheet, Text } from "react-native"
import { Verifiable, VerificationOffer, W3CCredential } from "verite"

import { getOrCreateDidKey } from "../lib/storage"
import { submitVerification } from "../lib/verification"
import type { VerificationSubmissionError } from "../lib/verification"
import { NavigationElement } from "../types"
import Card from "./Card"

const Verification: NavigationElement = ({ navigation, route }) => {
  const credential = route.params.credential as Verifiable<W3CCredential>
  const verificationOffer = route.params.payload as VerificationOffer
  const [title, setTitle] = useState("Verification")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(true)

  const onConfirm = () => {
    navigation.navigate("ScanScreen", { merge: true })
  }

  useEffect(() => {
    ;(async () => {
      const didKey = await getOrCreateDidKey()

      try {
        await submitVerification(didKey, verificationOffer, credential)

        setDescription("Success")
      } catch (e) {
        const err = e as VerificationSubmissionError
        setTitle(err.message)

        if ("details" in err) {
          setDescription(err.details ?? "")
        }
      }

      setLoading(false)
    })()
  }, [credential, navigation, verificationOffer])

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" />}
      {!loading && (
        <Card onConfirm={onConfirm} confirm="OK">
          <View style={styles.body}>
            <Text style={styles.name}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>
        </Card>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
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

export default Verification
