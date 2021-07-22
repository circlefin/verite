import { InputDescriptorConstraintField } from "@centre/verity"

import { VerifiableCredential } from "did-jwt-vc"

export type Match = {
  path: string
  matchedValue: any
}

export type FieldMatch = {
  field?: InputDescriptorConstraintField
  matches: Match[]
}

export type VerificationMatch = {
  cred: VerifiableCredential
  fieldMatches: FieldMatch[]
}