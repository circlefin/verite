import compact from "lodash/compact"
import React, { useState, useEffect } from "react"
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import { isExpired, isRevoked } from "verite"

import { getDisplayProperties } from "../lib/manifest-fns"
import { getCredentialsWithManifests } from "../lib/manifestRegistry"
import { saveRevocationStatus } from "../lib/storage"
import { CredentialAndManifest, NavigationElement } from "../types"
import NoCredentials from "./NoCredentials"

const CredentialsList: NavigationElement = ({ navigation }) => {
  const [credentials, setCredentials] = useState<
    CredentialAndManifest[] | undefined
  >()
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

  const renderItem = ({
    item,
    index
  }: {
    item: CredentialAndManifest
    index: number
  }) => {
    const credential = item.credential
    const manifest = item.manifest
    const revoked = item.revoked
    const expired = isExpired(credential)
    const { title, subtitle } = getDisplayProperties(manifest, credential)

    const thumbnail = manifest.output_descriptors[0].styles?.thumbnail?.uri

    return (
      <TouchableOpacity
        key={index}
        onPress={() => navigation.navigate("Details", { credential, revoked })}
      >
        <View
          style={
            revoked || expired
              ? styles.disabledCredential
              : styles.enabledCredential
          }
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
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container2}>
      <FlatList
        data={credentials}
        renderItem={renderItem}
        keyExtractor={(item) => item.credential.proof.jwt}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  enabledCredential: {
    margin: 16
  },
  disabledCredential: {
    margin: 16,
    opacity: 0.25
  },
  container2: {
    flex: 1
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
  thumbnail: {
    width: 32,
    height: 32
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

export default CredentialsList
