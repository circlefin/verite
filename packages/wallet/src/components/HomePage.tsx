import React, { useState } from "react"
import {
  Alert,
  View,
  StyleSheet,
  Button,
  LogBox,
  ActivityIndicator
} from "react-native"
import { CredentialManifest, VerificationOffer, handleScan } from "verite"

import { requestIssuance } from "../lib/issuance"
import { saveManifest } from "../lib/manifestRegistry"
import { getOrCreateDidKey } from "../lib/storage"
import { NavigationElement } from "../types"
import CredentialManifestPrompt from "./CredentialManifestPrompt"
import VerificationPrompt from "./VerificationPrompt"

/**
 * A function is passed to the Scanner route. We do not persist navigation
 * state or deep link to the Scanner route, so we can safely ignore this
 * warning.
 */
LogBox.ignoreLogs([
  "Non-serializable values were found in the navigation state"
])

/**
 * HomePage is the default "Scan" tab. After scanning a QR Code, users will be
 * presented with one of two workflows to confirm or cancel:
 *
 * 1) Issuance
 * 2) Verification
 */
const HomePage: NavigationElement = ({ navigation }) => {
  const [isScanning, setIsScanning] = useState<boolean>(false)
  const [isRequesting, setIsRequesting] = useState<boolean>(false)
  const [submissionUrl, setSubmissionUrl] = useState<string>()
  const [manifest, setManifest] = useState<CredentialManifest>()
  const [verificationOffer, setVerificationOffer] =
    useState<VerificationOffer>()

  /**
   * Reset state to intial state.
   */
  const clear = (): void => {
    setIsScanning(false)
    setIsRequesting(false)
    setManifest(undefined)
    setSubmissionUrl(undefined)
    setVerificationOffer(undefined)
  }

  /**
   * Callback after a QR code is scanned.
   *
   * @param data - the string data scanned with the QR Code scanner
   */
  const onScan = async (data: string): Promise<void> => {
    try {
      setIsScanning(true)
      const response = await handleScan(data)

      if (!response || !response.body) {
        setIsScanning(false)
        return
      }

      // In a perfect world, we would use the input descriptors to prompt the
      // user and ultimately satisfy either workflow, but for now we'll use
      // different code paths.

      // Issuance
      if ("manifest" in response.body) {
        // Persist manifest to disk
        await saveManifest(response.body.manifest)

        setSubmissionUrl(response.reply_url)
        setManifest(response.body.manifest)
      }

      // Verification
      if ("presentation_definition" in response.body) {
        setVerificationOffer(response as VerificationOffer)
      }

      setIsScanning(false)
    } catch (e) {
      console.error(e)
      setIsScanning(false)
      Alert.alert("Error", (e as Error).message)
    }
  }

  /**
   * Callback when a user cancels the issuance or verification prompt.
   */
  const onCancel = () => {
    clear()
  }

  /**
   * Callback when a user confirms they want a credential issued.
   */
  const onConfirm = async () => {
    if (!submissionUrl || !manifest) {
      return
    }
    setIsRequesting(true)
    const did = await getOrCreateDidKey()
    const credential = await requestIssuance(submissionUrl, did, manifest)

    if (credential) {
      navigation.navigate("Credentials", {
        screen: "Details",
        initial: false,
        params: {
          credential,
          revoked: false
        }
      })
      clear()
    } else {
      setIsRequesting(false)
      Alert.alert("Error", "Something went wrong.")
    }
  }

  /**
   * Callback when a user confirms they wish to verify a credential. In order
   * to verify a credential, the user needs to pick a credential to present
   * for verification.
   *
   * @param payload the verification request
   */
  const onVerificationConfirm = (payload: VerificationOffer) => {
    navigation.navigate("CredentialPicker", { payload })
    clear()
  }

  return (
    <View style={styles.container}>
      {isScanning ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          {manifest ? (
            <CredentialManifestPrompt
              credentialManifest={manifest}
              onCancel={onCancel}
              onConfirm={onConfirm}
              isLoading={isRequesting}
            />
          ) : null}

          {verificationOffer ? (
            <VerificationPrompt
              verificationOffer={verificationOffer}
              onCancel={onCancel}
              onConfirm={() => onVerificationConfirm(verificationOffer)}
              isLoading={isRequesting}
            />
          ) : null}

          {!manifest && !verificationOffer ? (
            <Button
              title="Scan QR Code"
              onPress={() => navigation.navigate("Scanner", { onScan })}
            />
          ) : null}
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center"
  }
})

export default HomePage
