import React from "react"
import {View, StyleSheet, Button} from "react-native"

export default function HomePage({navigation}) {
  return (
    <View style={styles.container}>
      <Button
        title={"Scan QR Code"}
        onPress={() =>
          navigation.navigate("Scanner", {
            onScan: ({type, data}) => {
              alert(
                `Bar code with type ${type} and data ${data} has been scanned!`
              )
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
