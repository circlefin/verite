import React, { useEffect, useState } from "react"
import { Alert, View, StyleSheet, Text } from "react-native"
import { getOrCreateDidKey } from "../lib/storage"
import { requestVerification } from "../lib/verification"

export default function Verification({ navigation, route }): Element {
  const { credential, payload } = route.params
  const [loading, setLoading] = useState(true)
  const presentation = payload.presentation

  useEffect(() => {
    ;(async () => {
      const didKey = await getOrCreateDidKey()
      const response = await requestVerification(
        didKey,
        presentation,
        credential
      )

      const title = "Verification"
      const buttons = [
        {
          text: "OK",
          onPress: () => navigation.navigate("Scan", { merge: true })
        }
      ]

      if (response) {
        Alert.alert(title, "Success", buttons)
      } else {
        Alert.alert(title, "Unsuccessful", buttons)
      }
      setLoading(false)
    })()
  }, [credential, navigation, presentation])

  return (
    <View style={styles.container}>
      {loading ? <Text>Loading</Text> : null}
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
