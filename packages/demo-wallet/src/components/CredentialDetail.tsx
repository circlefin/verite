import compact from "lodash/compact"
import React from "react"
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

/**
 * This component can only render KYCAMLAttestation VCs at the moment
 */
const CredentialDetail = ({ route }): Element => {
  const { credential } = route.params

  // TODO: Is it unsafe to dig into this?
  const attestation = credential.credentialSubject.KYCAMLAttestation

  if (!attestation) {
    return <Text>Decoding Details</Text>
  }

  // The only required fields
  const authorityId = attestation.authorityId
  const approvalDate = attestation.approvalDate

  // Optional Fields
  const expirationDate = attestation.expirationDate
  const authority = attestation.authorityName
  const authorityUrl = attestation.authorityUrl

  const scores = (attestation.serviceProviders || []).map((sp, index) => {
    return (
      <Text key={index}>
        <Text style={{ fontWeight: "600" }}>{sp.name}:</Text> {sp.score}
        {sp.completionDate ? `\nCompleted ${sp.completionDate}` : ""}
        {sp.comment ? `\n${sp.comment}` : ""}
      </Text>
    )
  })

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
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
