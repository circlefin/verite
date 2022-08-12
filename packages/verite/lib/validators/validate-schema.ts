import Ajv from "ajv"

import { ValidationError } from "../errors"

import type { Attestation, Verifiable, W3CCredential } from "../../types"
export { findSchemaById } from "./schemas"

const ajv = new Ajv()

export function validateAttestationSchema(
  attestation: Attestation | Verifiable<W3CCredential>,
  schema: Record<string, unknown>
): void {
  if (!attestation) {
    throw new ValidationError("No attestation present in credential")
  }

  const validate = ajv.compile(schema)
  const valid = validate(attestation)

  if (!valid && validate.errors) {
    const error = validate.errors[0]
    throw new ValidationError(
      `${error.keyword} json schema validation failure`,
      `${error.instancePath ? error.instancePath : "input"} ${error.message}`
    )
  }
}
