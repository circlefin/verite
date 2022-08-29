export type Schema = {
  uri: string
  required?: boolean
}

export type CredentialSchemaConstraint = {
  path: string[],
  filter: {
    type: "string"
    pattern: string
  }
}

export type CredentialSchema = {
  id: string,
  type: string
}