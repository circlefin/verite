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
  InputDescriptor,
  InputDescriptorConstraintField,
  isExpired,
  isRevoked,
  Verifiable,
  VerificationOffer,
  W3CCredential
} from "verite"

import { getDisplayProperties } from "../lib/descriptor-fns"
import { getCredentialsWithDescriptors } from "../lib/schemaRegistry"
import { saveRevocationStatus } from "../lib/storage"
import { getValueOrLastArrayEntry } from "../lib/utils"
import { CredentialAndDescriptor, NavigationElement } from "../types"
import NoCredentials from "./NoCredentials"

/**
 * Predicate to determine if a credential satisfies a given input descriptor
 */
const isEnabled = (
  credential: Verifiable<W3CCredential>,
  inputDescriptor: InputDescriptor,
  revoked: boolean
): boolean => {
  // for now, we are assuming the credential type is the same as the input
  // descriptor id. This assumption may need to change in the future.
  const credentialType = getValueOrLastArrayEntry(credential.type)
  const inputDescriptorId = inputDescriptor.id
  /*
  console.log(
    `credential type = ${credentialType}, input descriptor id = ${inputDescriptorId}`
  )*/

  if (credentialType !== inputDescriptorId) {
    return false
  }

  /**
   * If we know the credential is revoked, it should not be selectable.
   */
  if (revoked) {
    return false
  }

  /**
   * If the credential is expired, do not enable it in the list
   */
  if (isExpired(credential)) {
    return false
  }

  // Check issuer constraint
  const fields: InputDescriptorConstraintField[] =
    get(inputDescriptor, "constraints.fields") || []
  const patterns: string[] = compact(
    fields.map((f) => get(f, "filter.pattern"))
  )

  if (!patterns.length) {
    return false
  }

  return patterns.some((pattern) => {
    const re = new RegExp(pattern)
    return re.test(credential.issuer.id)
  })
}

const CredentialPicker: NavigationElement = ({ navigation, route }) => {
  const [credentials, setCredentials] = useState<
    CredentialAndDescriptor[] | undefined
  >()

  const verificationRequest = route.params.payload as VerificationOffer
  const inputDescriptor =
    verificationRequest.body.presentation_definition.input_descriptors[0]

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      const creds = await getCredentialsWithDescriptors()
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

  const renderItem = ({ item }: { item: CredentialAndDescriptor }) => {
    const descriptor = item.descriptor
    const credential = item.credential
    const revoked = item.revoked

    const expired = isExpired(credential)
    const { title, subtitle } = getDisplayProperties(descriptor, credential)

    const enabled = isEnabled(credential, inputDescriptor, revoked)
    const style = enabled ? styles.enabled : styles.disabled
    const thumbnail = descriptor.styles?.thumbnail?.uri

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
