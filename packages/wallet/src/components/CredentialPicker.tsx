import { compact, get } from "lodash"
import React, { useState, useEffect } from "react"
import {
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator
} from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import {
  CredentialManifest,
  InputDescriptor,
  InputDescriptorConstraintField,
  isExpired,
  isRevoked,
  Verifiable,
  VerificationOffer,
  W3CCredential
} from "verite"

import { getDisplayProperties } from "../lib/manifest-fns"
import { getCredentialsWithManifests } from "../lib/manifestRegistry"
import { saveRevocationStatus } from "../lib/storage"
import { getValueOrLastArrayEntry } from "../lib/utils"
import { CredentialAndManifest, NavigationElement } from "../types"
import NoCredentials from "./NoCredentials"

/**
 * Predicate to determine if a credential satisfies a given input descriptor
 */
const isEnabled = (
  credential: Verifiable<W3CCredential>,
  manifest: CredentialManifest,
  inputDescriptor: InputDescriptor,
  revoked: boolean
): boolean => {
  // for now, we are assuming the credential type is the same as the input
  // descriptor id. This assumption may need to change in the future.
  const credentialType = getValueOrLastArrayEntry(credential.type)
  const inputDescriptorId = inputDescriptor.id
  console.log(
    `credential type = ${credentialType}, input descriptor id = ${inputDescriptorId}`
  )

  if (credentialType !== inputDescriptorId) {
    return false
  }
  console.log("checkpt1")
  /**
   * If we know the credential is revoked, it should not be selectable.
   */
  if (revoked) {
    return false
  }
  console.log("checkpt2")

  /**
   * If the credential is expired, do not enable it in the list
   */
  if (isExpired(credential)) {
    return false
  }
  console.log("checkpt3")

  // Check issuer constraint
  const fields: InputDescriptorConstraintField[] =
    get(inputDescriptor, "constraints.fields") || []
  const patterns: string[] = compact(
    fields.map((f) => get(f, "filter.pattern"))
  )
  console.log("checkpt4")

  if (!patterns.length) {
    return false
  }
  console.log("checkpt5")

  return patterns.some((pattern) => {
    const re = new RegExp(pattern)
    console.log("checkpt6")
    return re.test(credential.issuer.id)
  })
}

const CredentialPicker: NavigationElement = ({ navigation, route }) => {
  const [credentials, setCredentials] = useState<
    CredentialAndManifest[] | undefined
  >()

  const verificationRequest = route.params.payload as VerificationOffer
  const inputDescriptor =
    verificationRequest.body.presentation_definition.input_descriptors[0]

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      const creds = await getCredentialsWithManifests()
      setCredentials(creds)

      // Check revocation status, but don't block on it.
      for (const cred of creds) {
        const r = await isRevoked(cred.credential)
        await saveRevocationStatus(cred.credential, r)
      }
    })

    return unsubscribe
  }, [navigation])

  if (!credentials) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (credentials.length === 0) {
    return <NoCredentials />
  }

  const renderItem = ({ item }: { item: CredentialAndManifest }) => {
    console.log("hi1")
    const manifest = item.manifest
    const credential = item.credential
    console.log("hi2")

    const revoked = item.revoked
    console.log("hi3")

    const expired = isExpired(credential)
    const { title, subtitle } = getDisplayProperties(manifest, credential)

    const enabled = isEnabled(credential, manifest, inputDescriptor, revoked)
    const style = enabled ? styles.enabled : styles.disabled
    const thumbnail = manifest.output_descriptors[0].styles?.thumbnail?.uri

    return (
      <TouchableOpacity
        style={style}
        onPress={() => {
          navigation.navigate({
            name: "Verification",
            params: {
              payload: verificationRequest,
              credential
            },
            merge: true
          })
        }}
      >
        <View style={styles.container}>
          <View style={styles.iconWrapper}>
            {thumbnail ? (
              <Image
                style={styles.thumbnail}
                source={{ uri: thumbnail, cache: "force-cache" }}
              />
            ) : (
              <Ionicons name="finger-print" size={32} />
            )}
          </View>

          <Text style={styles.rowContent}>
            {compact([title, subtitle]).join("\n")}
          </Text>
          {revoked && <Text style={styles.badge}>Revoked</Text>}
          {expired && <Text style={styles.badge}>Expired</Text>}
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <FlatList
      data={credentials}
      renderItem={renderItem}
      keyExtractor={(item) => item.credential.proof.jwt}
    />
  )
}

const styles = StyleSheet.create({
  enabled: {
    margin: 16
  },
  disabled: {
    margin: 16,
    opacity: 0.25
  },
  thumbnail: {
    width: 32,
    height: 32
  },
  container: {
    flexDirection: "row",
    alignItems: "center"
  },
  centered: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center"
  },
  iconWrapper: {
    paddingRight: 16
  },
  rowContent: {
    flexGrow: 1
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    fontSize: 14,
    backgroundColor: "#FECACA",
    color: "#7F1D1D",
    overflow: "hidden"
  }
})

export default CredentialPicker
