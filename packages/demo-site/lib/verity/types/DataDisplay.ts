// https://identity.foundation/credential-manifest/wallet-rendering/#data-display

export type DataMappingSchemaNonString = {
  type: "boolean" | "number" | "integer"
}

export type DataMappingSchemaString = {
  type: "string"
  format?:
    | "date-time"
    | "time"
    | "date"
    | "email"
    | "idn-email"
    | "hostname"
    | "idn-hostname"
    | "ipv4"
    | "ipv6"
    | "uri"
    | "uri-reference"
    | "iri"
    | "iri-reference"
}

export type DataMappingSchema =
  | DataMappingSchemaString
  | DataMappingSchemaNonString

export type DataMappingText = {
  text: string
}

export type DataMappingPath = {
  path: string[]
  fallback?: string
  schema?: DataMappingSchema // NOTE: This is required, but left off in our case for our sample JSON
}

export type DisplayMapping = DataMappingPath | DataMappingText

export type LabeledDisplayMapping = DisplayMapping & {
  label: string
}

export type DataDisplay = {
  title?: DisplayMapping
  subtitle?: DisplayMapping
  description?: DisplayMapping | { text: string }
  properties?: LabeledDisplayMapping[]
}
