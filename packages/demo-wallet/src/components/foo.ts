import { Verifiable, W3CCredential } from "did-jwt-vc"
import { JSONPath } from "jsonpath-plus"
import get from "lodash/get"
import { CredentialManifest } from "../lib/verity"

interface DisplayProperties {
  title?: string
  subtitle?: string
  description?: string
}

const findMap = (list, func) => {
  let result = null
  list.find(item => {
    result = func(item)
  })

  return result
}

const getDisplayProperty = (
  property: string,
  manifest: CredentialManifest,
  credential: Verifiable<W3CCredential>,
  fallback?: string
): string => {
  const manifestCallback = get(
    manifest.output_descriptors[0],
    `display.${property}.fallback`
  )
  if (manifestCallback) {
    fallback = manifestCallback
  }

  // Display values can have an optional `text` property
  const text = manifest.output_descriptors[0].display[property].text
  if (text) {
    return text
  }

  // Display values can have an array of JSON paths
  const paths = manifest.output_descriptors[0].display[property].path
  return (
    findMap(paths, path => {
      return JSONPath({ path, json: credential.credentialSubject, wrap: false })
    }) || manifestCallback
  )
}

export const getDisplayProperties = (
  manifest: CredentialManifest,
  credential: Verifiable<W3CCredential>
): DisplayProperties => {
  return {
    title: getDisplayProperty("title", manifest, credential, "KYC Attestation"),
    subtitle: getDisplayProperty("subtitle", manifest, credential),
    description: getDisplayProperty(
      "description",
      manifest,
      credential,
      "The KYC authority processes Know Your Customer and Anti-Money Laundering analysis, potentially employing a number of internal and external vendor providers."
    )
  }
}
