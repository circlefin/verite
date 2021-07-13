import compact from "lodash/compact"
import React, { useState, useEffect } from "react"
import { FlatList, Text, TouchableOpacity, View } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import { asyncMap } from "../lib/async-fns"
import { getCredentials } from "../lib/storage"
import { decodeVc } from "../lib/verity"

const CredentialsList = ({ navigation }) => {
  const [credentials, setCredentials] = useState([])
  useEffect(() => {
    ;(async () => {
      const creds = await getCredentials()
      const doo = await asyncMap(creds, async cred => {
        const vc = await decodeVc(cred.verifiableCredential[0])
        const attestation =
          vc?.verifiableCredential.credentialSubject.KYCAMLAttestation
        return {
          id: cred.credential_fulfillment.id,
          authorityId: attestation.authorityId,
          authorityName: attestation.authorityName,
          authorityUrl: attestation.authorityUrl,
          raw: vc,
          cred
        }
      })
      setCredentials(doo)
    })()
  }, [credentials])

  if (credentials.length === 0) {
    return <Text>No Credentials</Text>
  }

  const renderItem = ({ item }) => {
    console.log(item)
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
              item.id,
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
