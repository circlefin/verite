import { JSONPath } from "jsonpath-plus"
import {
  CredentialManifest,
  DisplayMapping,
  LabeledDisplayMapping,
  Verifiable,
  W3CCredential
} from "verite"

function findMap<T, P>(list: T[], func: (arg0: T) => P | undefined) {
  let result
  list.find((item) => {
    result = func(item)
  })

  return result
}

const getDisplayProperty = (
  property?: DisplayMapping,
  credential?: Verifiable<W3CCredential>,
  fallback?: string
): string | undefined => {
  if (!property) {
    return fallback
  }

  if ("text" in property) {
    // DataMapping is of type DataMappingText
    return property.text
  }
  // If DisplayMapping has a fallback, use it.
  const manifestFallback = property.fallback
  if (manifestFallback) {
    fallback = manifestFallback
  }

  // If we do not have a credential by this point, we can early return the fallback
  if (!credential) {
    return fallback
  }

  // Display values can have an array of JSON paths
  const paths = property?.path
  if (paths) {
    return (
      findMap(paths, (path) => {
        return JSONPath({
          path,
          json: credential.credentialSubject,
          wrap: false
        })
      }) ?? fallback
    )
  }

  return fallback
}

const getLabeledDisplayProperty = (
  property: LabeledDisplayMapping,
  credential: Verifiable<W3CCredential>
) => {
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
): {
  title?: string
  subtitle?: string
  description?: string
  properties?: { label: string; value?: string }[]
} => {
  const title = manifest.output_descriptors[0].display?.title
  const subtitle = manifest.output_descriptors[0].display?.subtitle
  const description = manifest.output_descriptors[0].display?.description
  const properties = manifest.output_descriptors[0].display?.properties?.map(
    (property) => getLabeledDisplayProperty(property, credential)
  )

  return {
    title: getDisplayProperty(title, credential),
    subtitle: getDisplayProperty(subtitle, credential),
    description: getDisplayProperty(description, credential),
    properties
  }
}
