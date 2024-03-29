import compact from "lodash/compact"
import last from "lodash/last"
import React, { useEffect, useState } from "react"
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image
} from "react-native"
import JSONTree from "react-native-json-tree"
import { Colors } from "react-native/Libraries/NewAppScreen"
import {
  asyncMap,
  OutputDescriptor,
  MaybeRevocableCredential,
  isRevocable
} from "verite"

import { getDisplayProperties } from "../lib/descriptor-fns"
import { getDescriptor } from "../lib/schemaRegistry"
import { NavigationElement } from "../types"

const Section: React.FC<{
  title: string
  subtitle?: string
}> = ({ children, title, subtitle }) => {
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: Colors.black
          }
        ]}
      >
        {title}
      </Text>

      {subtitle ? (
        <Text
          style={[
            styles.sectionSubtitle,
            {
              color: Colors.black
            }
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
      <Text
        style={[
          styles.sectionDescription,
          {
            color: Colors.dark
          }
        ]}
      >
        {children}
      </Text>
    </View>
  )
}

const CredentialDetail: NavigationElement = ({ navigation, route }) => {
  const credential = route.params.credential as MaybeRevocableCredential
  const revoked = route.params.revoked as boolean

  const [descriptor, setDescriptor] = useState<OutputDescriptor | undefined>()
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      const descriptors = await asyncMap<string, OutputDescriptor | undefined>(
        credential.type,
        async (type) => getDescriptor(type)
      )
      setDescriptor(last(compact(descriptors)))
    })

    return unsubscribe
  }, [credential, navigation])

  const expirationDate = credential.expirationDate
  const revocable = isRevocable(credential)

  let display
  if (descriptor && credential) {
    display = getDisplayProperties(descriptor, credential)
  }

  const properties = (display?.properties ?? []).map((property, index) => {
    return (
      <Section key={index} title={property.label}>
        {property.value}
      </Section>
    )
  })

  const thumbnail = descriptor?.styles?.thumbnail?.uri
  const hero = descriptor?.styles?.hero?.uri

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {hero && (
          <Image
            style={styles.hero}
            source={{ uri: hero, cache: "force-cache" }}
          />
        )}

        {descriptor && (
          <View style={styles.header}>
            {thumbnail && (
              <Image
                style={styles.thumbnail}
                source={{ uri: thumbnail, cache: "force-cache" }}
              />
            )}
            <View style={styles.headerSection}>
              <Section
                title={display?.title ?? ""}
                subtitle={display?.subtitle}
              >
                {display?.description}
              </Section>
            </View>
          </View>
        )}

        {properties}

        {revocable && (
          <Section title="Revoked">{revoked ? "Yes" : "No"}</Section>
        )}

        {expirationDate && <Section title="Expires">{expirationDate}</Section>}

        <View>
          <Text style={styles.rawTitle}>Raw Credential</Text>
          <JSONTree data={credential} />
        </View>
        {descriptor && (
          <View>
            <Text style={styles.rawTitle}>Raw Manifest</Text>
            <JSONTree data={descriptor} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10
  },
  hero: {
    width: "100%",
    aspectRatio: 3
  },
  thumbnail: {
    flexShrink: 0,
    width: 64,
    height: 64
  },
  headerSection: {
    paddingRight: 30
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "600"
  },
  sectionSubtitle: {
    fontSize: 20,
    fontWeight: "500"
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "400"
  },
  rawTitle: {
    fontSize: 24,
    fontWeight: "600",
    paddingHorizontal: 24,
    paddingVertical: 12
  },
  score: {
    fontWeight: "600"
  }
})

export default CredentialDetail
