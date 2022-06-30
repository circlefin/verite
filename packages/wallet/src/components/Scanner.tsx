import { BarCodeEvent, BarCodeScanner } from "expo-barcode-scanner"
import React, { useState, useEffect } from "react"
import { Text, View, StyleSheet, Button } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"

import { NavigationElement } from "../types"

const Scanner: NavigationElement = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [scanned, setScanned] = useState(false)

  useEffect(() => {
    ;(async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync()
      setHasPermission(status === "granted")
    })()
  }, [hasPermission])

  const handleBarCodeScanned = ({ data }: BarCodeEvent) => {
    setScanned(true)
    navigation.navigate({
      name: "ScanScreen",
      params: { scanData: data },
      merge: true
    })
  }

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>
  }
  if (hasPermission === false) {
    return <Text>No access to camera. Go to settings and enable it.</Text>
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.scanCrosshairs}>
        <Ionicons
          name="scan-outline"
          size={32}
          style={[
            styles.scanCrosshairs,
            scanned ? styles.scanComplete : styles.scanIncomplete
          ]}
        />
      </View>
      {scanned && (
        <Button title="Tap to Scan Again" onPress={() => setScanned(false)} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center"
  },
  scanCrosshairs: {
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: 300
  },
  scanIncomplete: {
    color: "white"
  },
  scanComplete: {
    color: "#6EE7B7"
  }
})

export default Scanner
