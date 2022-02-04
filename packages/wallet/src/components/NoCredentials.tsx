import React, { FC } from "react"
import { StyleSheet, Text, View } from "react-native"

const NoCredentials: FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>No Credentials</Text>
      <Text style={styles.copy}>
        Visit <Text style={styles.strong}>verite.id</Text> to request
        credentials.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 20
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    padding: 10
  },
  copy: {
    fontSize: 16
  },
  strong: {
    fontWeight: "600"
  }
})

export default NoCredentials
