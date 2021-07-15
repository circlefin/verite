import compact from "lodash/compact"
import React, { useState, useEffect } from "react"
import { FlatList, Text, TouchableOpacity, View } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import { asyncMap } from "../lib/async-fns"
import {
  findManifestForCredential,
  getDisplayProperties
} from "../lib/manifest-fns"
import { getCredentials } from "../lib/storage"
import { KYCAMLAttestation } from "../lib/verity"

const CredentialsList = ({ navigation }): Element => {
  const [credentials, setCredentials] = useState([])
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      const creds = await getCredentials()
      const credentialAndManifest = await asyncMap(
        creds,
        async (credential, index) => {
          // TODO: Is it unsafe to dig into this?
          const attestation: KYCAMLAttestation | undefined =
            credential.credentialSubject.KYCAMLAttestation
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
    return (
      <TouchableOpacity
        style={{
          margin: 16
        }}
        onPress={() =>
          navigation.navigate("Details", { credential: item.credential })
        }>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ paddingRight: 16 }}>
            <Ionicons name={"finger-print"} size={32} />
          </View>

          <Text>{compact([title, subtitle]).join("\n")}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <FlatList
      data={credentials}
      renderItem={renderItem}
      keyExtractor={item => item.id}
    />
  )
}

export default CredentialsList
