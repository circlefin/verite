import { Verifiable, W3CCredential } from "did-jwt-vc"
import compact from "lodash/compact"
import React, { useState, useEffect } from "react"
import { StyleSheet } from "react-native"
import { FlatList, Text, TouchableOpacity, View } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import {
  findManifestForCredential,
  getDisplayProperties
} from "../lib/manifest-fns"
import { getCredentials } from "../lib/storage"
import { asyncMap, InputDescriptor } from "../lib/verity"

/**
 * Predicate to determine if a credential satisfies a given input descriptor
 */
const isEnabled = (
  credential: Verifiable<W3CCredential>,
  manifest,
  inputDescriptor: InputDescriptor
): boolean => {
  // Check schemas match
  const credentialSchema = manifest.output_descriptors[0].schema[0].uri
  const inputSchema = inputDescriptor.schema[0].uri

  if (credentialSchema !== inputSchema) {
    return false
  }

  // Check constraints
  const pattern = inputDescriptor.constraints.fields[0].filter.pattern
  const re = new RegExp(pattern)
  if (re.test(credential.issuer.id)) {
    return true
  }

  return false
}

const CredentialPicker = ({ navigation, route }): Element => {
  const { payload } = route.params
  const presentation = payload.presentation
  const inputDescriptor =
    presentation.presentation_definition.input_descriptors[0]

  const [credentials, setCredentials] = useState([])
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      const creds = await getCredentials()
      const credentialAndManifest = await asyncMap(
        creds,
        async (credential, index) => {
          const manifest = await findManifestForCredential(credential)

          return {
            id: index, // unique id for FlatList
            credential,
            manifest
          }
        }
      )
      setCredentials(credentialAndManifest)
    })

    return unsubscribe
  }, [navigation])

  if (credentials.length === 0) {
    return <Text>No Credentials</Text>
  }

  const renderItem = ({ item }) => {
    const displayProperties = getDisplayProperties(
      item.manifest,
      item.credential
    )
    const { title, subtitle } = displayProperties

    const enabled = isEnabled(item.credential, item.manifest, inputDescriptor)
    const style = enabled ? styles.enabled : styles.disabled

    return (
      <TouchableOpacity
        style={style}
        onPress={() => {
          if (!enabled) {
            return
          }
          navigation.navigate({
            name: "Verification",
            params: {
              payload,
              credential: item.credential
            },
            merge: true
          })
        }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ paddingRight: 16 }}>
            <Ionicons name={"finger-print"} size={32} />
          </View>

          <Text>{compact([title, subtitle]).join("\n")}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  const styles = StyleSheet.create({
    enabled: {
      margin: 16
    },
    disabled: {
      margin: 16,
      opacity: 0.25
    }
  })

  return (
    <FlatList
      data={credentials}
      renderItem={renderItem}
      keyExtractor={item => item.id}
    />
  )
}

export default CredentialPicker
