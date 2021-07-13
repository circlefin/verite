import React, { useState, useEffect } from "react"
import { FlatList, Text, TouchableOpacity } from "react-native"
import { getCredentials } from "../lib/storage"

const CredentialsList = ({ navigation }) => {
  const [credentials, setCredentials] = useState([])
  useEffect(() => {
    ;(async () => {
      setCredentials(await getCredentials())
    })()
  }, [credentials])

  console.log(credentials)

  if (credentials.length === 0) {
    return <Text>No Credentials</Text>
  }

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={{
          margin: 16
        }}
        onPress={() => navigation.navigate("Details", { credential: item })}>
        <Text>{item.credential_fulfillment.id}</Text>
      </TouchableOpacity>
    )
  }

  return (
    <FlatList
      data={credentials}
      renderItem={renderItem}
      keyExtractor={item => item.credential_fulfillment.id}
    />
  )
}

export default CredentialsList
