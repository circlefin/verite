import { Verifiable, W3CCredential } from "did-jwt-vc"
import { JSONPath } from "jsonpath-plus"

import compact from "lodash/compact"
import last from "lodash/last"
import { getManifest } from "../lib/manifestRegistry"
import { asyncMap } from "./async-fns"
import {
  CredentialManifest,
  DisplayMapping,
  LabeledDataMappingSchema
} from "./verity"

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
  property?: DisplayMapping,
  credential?: Verifiable<W3CCredential>,
  fallback?: string
): string | undefined => {
  // If DisplayMapping has a fallback, use it.
  const manifestFallback = property?.fallback
  if (manifestFallback) {
    fallback = manifestFallback
  }

  // Display values can have an optional `text` property
  const text = property?.text
  if (text) {
    return text
  }

  // If we do not have a credential by this point, we can early return the fallback
  if (!credential) {
    return fallback
  }

  // Display values can have an array of JSON paths
  const paths = property?.path
  if (paths) {
    return (
      findMap(paths, path => {
        return JSONPath({
          path,
          json: credential.credentialSubject,
          wrap: false
        })
      }) || fallback
    )
  }

  return fallback
}

const getLabeledDisplayProperty = (
  property: LabeledDataMappingSchema,
  credential: Verifiable<W3CCredential>
): any => {
  const value = getDisplayProperty(property, credential, "")
  const label = property.label
  return {
    label,
    value
  }
}

export const getDisplayProperties = (
  manifest: CredentialManifest,
  credential: Verifiable<W3CCredential>
): any => {
  const title = manifest.output_descriptors[0].display?.title
  const subtitle = manifest.output_descriptors[0].display?.subtitle
  const description = manifest.output_descriptors[0].display?.description

  const properties = manifest.output_descriptors[0].display?.properties?.map(
    property => getLabeledDisplayProperty(property, credential)
  )
  return {
    title: getDisplayProperty(title, credential, "KYC Attestation"),
    subtitle: getDisplayProperty(subtitle, credential),
    description: getDisplayProperty(
      description,
      credential,
      "The KYC authority processes Know Your Customer and Anti-Money Laundering analysis, potentially employing a number of internal and external vendor providers."
    ),
    properties
  }
}

export const findManifestForCredential = async (
  credential: Verifiable<W3CCredential>
): Promise<CredentialManifest> => {
  const manifests = await asyncMap(
    credential.type,
    async (type): Promise<CredentialManifest> => {
      return await getManifest(type)
    }
  )
  return last(compact(manifests))
}
