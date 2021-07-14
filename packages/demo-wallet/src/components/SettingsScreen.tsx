import React, { useState, useEffect } from "react"
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
  Text,
  Button
} from "react-native"
import { Colors } from "react-native/Libraries/NewAppScreen"
import { clear as clearStorage } from "../lib/storage"

import { getOrCreateDidKey } from "../lib/storage"
import { DidKey } from "../lib/verity"

const Section: React.FC<{
  title: string
}> = ({ children, title }) => {
  const isDarkMode = useColorScheme() === "dark"
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black
          }
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark
          }
        ]}>
        {children}
      </Text>
    </View>
  )
}

const SettingsScreen = (): Element => {
  const [did, setDid] = useState<DidKey | null>(null)

  useEffect(() => {
    ;(async () => {
      const didKey = await getOrCreateDidKey()
      setDid(didKey)
    })()
  }, [])

  if (!did) {
    return <View />
  }

  const publicKey = Buffer.from(did.publicKey).toString("hex")
  const privateKey = Buffer.from(did.privateKey).toString("hex")

  return (
    <SafeAreaView>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <Section title="Id">
          <Text style={styles.sectionDescription}>{did.id}</Text>
        </Section>
        <Section title="Controller">
          <Text style={styles.sectionDescription}>{did.controller}</Text>
        </Section>
        <Section title="Public Key">
          <Text style={styles.sectionDescription}>{publicKey}</Text>
        </Section>
        <Section title="Private Key">
          <Text style={styles.sectionDescription}>{privateKey}</Text>
        </Section>
        <Section title="Debug Tols">
          <Button
            title={"Clear App Data"}
            onPress={async () => {
              await clearStorage()
            }}
          />
        </Section>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "600"
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "400"
  }
})

export default SettingsScreen
