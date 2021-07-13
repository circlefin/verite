import React from "react"
import { SafeAreaView, ScrollView } from "react-native"
import JSONTree from "react-native-json-tree"

const CredentialDetail = ({ route }) => {
  const json = route.params.credential
  console.log("json", json)
  return (
    <SafeAreaView>
      <ScrollView>
        <JSONTree data={json} />
      </ScrollView>
    </SafeAreaView>
  )
}

export default CredentialDetail
