import { Verifiable, W3CCredential } from "did-jwt-vc"
import compact from "lodash/compact"
import last from "lodash/last"
import React, { useEffect, useState } from "react"
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  Linking
} from "react-native"
import JSONTree from "react-native-json-tree"
import { Colors } from "react-native/Libraries/NewAppScreen"
import { asyncMap } from "../lib/async-fns"
import { getDisplayProperties } from "../lib/manifest-fns"
import { getManifest } from "../lib/manifestRegistry"
import { CredentialManifest } from "../lib/verity"

const Section: React.FC<{
  title: string
  subtitle?: string
}> = ({ children, title, subtitle }) => {
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

      {subtitle ? (
        <Text
          style={[
            styles.sectionSubtitle,
            {
              color: isDarkMode ? Colors.white : Colors.black
            }
          ]}>
          {subtitle}
        </Text>
      ) : null}
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

/**
 * This component can only render KYCAMLAttestation VCs at the moment
 */
const CredentialDetail = ({ navigation, route }): Element => {
  const credential: Verifiable<W3CCredential> = route.params.credential

  const [manifest, setManifest] = useState<CredentialManifest | undefined>()
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      const manifests = await asyncMap(
        credential.type,
        async (type): Promise<CredentialManifest> => {
          return await getManifest(type)
        }
      )
      setManifest(last(compact(manifests)))
    })

    return unsubscribe
  }, [credential, navigation])

  // TODO: Is it unsafe to dig into this?
  const attestation = credential.credentialSubject.KYCAMLAttestation

  // The only required fields
  const authorityId = attestation?.authorityId
  const approvalDate = attestation?.approvalDate

  // Optional Fields
  const expirationDate = attestation?.expirationDate
  const authority = attestation?.authorityName
  const authorityUrl = attestation?.authorityUrl

  const scores = (attestation?.serviceProviders || []).map((sp, index) => {
    return (
      <Text key={index}>
        <Text style={{ fontWeight: "600" }}>{sp.name}:</Text> {sp.score}
        {sp.completionDate ? `\nCompleted ${sp.completionDate}` : ""}
        {sp.comment ? `\n${sp.comment}` : ""}
      </Text>
    )
  })

  let display
  if (manifest && credential) {
    display = getDisplayProperties(manifest, credential)
  }

  const properties = (display?.properties || []).map((property, index) => {
    return (
      <Section key={index} title={property.label}>
        {property.value}
      </Section>
    )
  })

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {manifest ? (
          <View>
            <Section title={display.title} subtitle={display.subtitle}>
              {display.description}
            </Section>

            {properties}
          </View>
        ) : null}
        <Section title="Authority">
          <Text
            onPress={async () => {
              if (authorityUrl) {
                await Linking.openURL(authorityUrl)
              }
            }}>
            {compact([authority, authorityUrl, authorityId]).join("\n")}
          </Text>
        </Section>

        {approvalDate ? (
          <Section title="Approved">{approvalDate}</Section>
        ) : null}

        {expirationDate ? (
          <Section title="Expires">{expirationDate}</Section>
        ) : null}

        {scores.length > 0 ? (
          <Section title="Scores">
            {scores.map((score, index) => {
              return (
                <Text key={index}>
                  {score}
                  {"\n"}
                </Text>
              )
            })}
          </Section>
        ) : null}

        <View>
          <Text style={styles.rawTitle}>Raw Data</Text>
          <JSONTree data={credential} />
        </View>
        {manifest ? (
          <View>
            <Text style={styles.rawTitle}>Raw Data</Text>
            <JSONTree data={manifest} />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
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
  }
})

export default CredentialDetail
