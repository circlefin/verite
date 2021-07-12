import React from "react"
import { View, Text } from "react-native"

const SettingsScreen = () => {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: "column",
        justifyContent: "center"
      }}>
      <Text style={{ textAlign: "center" }}>Settings go here</Text>
    </View>
  )
}

export default SettingsScreen
