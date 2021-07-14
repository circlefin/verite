import compact from "lodash/compact"
import React, { useState, useEffect } from "react"
import { FlatList, Text, TouchableOpacity, View } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import { getCredentials } from "../lib/storage"

const CredentialsList = ({ navigation }): Element => {
  const [credentials, setCredentials] = useState([])
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      const creds = await getCredentials()
      console.log("creds", creds)
      const doo = creds.map((cred, index) => {
        // TODO: Is it unsafe to dig into this?
        const attestation = cred.credentialSubject.KYCAMLAttestation

        return {
          id: index, // unique id for FlatList
          authorityId: attestation.authorityId,
          authorityName: attestation.authorityName,
          authorityUrl: attestation.authorityUrl,
          cred
        }
      })
      setCredentials(doo)
    })

    return unsubscribe
  }, [navigation])

  if (credentials.length === 0) {
    return <Text>No Credentials</Text>
  }

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={{
          margin: 16
        }}
        onPress={() =>
          navigation.navigate("Details", { credential: item.cred })
        }>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ paddingRight: 16 }}>
            <Ionicons name={"finger-print"} size={32} />
          </View>

          <Text>
            {compact([
              item.authorityName,
              item.authorityUrl,
              item.authorityId
            ]).join("\n")}
          </Text>
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
