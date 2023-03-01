import { JSONPath } from "jsonpath-plus"
import {
  DisplayMapping,
  LabeledDisplayMapping,
  OutputDescriptor,
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
  const descriptorFallback = property.fallback
  if (descriptorFallback) {
    fallback = descriptorFallback
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
  descriptor: OutputDescriptor,
  credential: Verifiable<W3CCredential>
): {
  title?: string
  subtitle?: string
  description?: string
  properties?: { label: string; value?: string }[]
} => {
  const title = descriptor.display?.title
  const subtitle = descriptor.display?.subtitle
  const description = descriptor.display?.description
  const properties = descriptor.display?.properties?.map((property) =>
    getLabeledDisplayProperty(property, credential)
  )

  return {
    title: getDisplayProperty(title, credential),
    subtitle: getDisplayProperty(subtitle, credential),
    description: getDisplayProperty(description, credential),
    properties
  }
}
