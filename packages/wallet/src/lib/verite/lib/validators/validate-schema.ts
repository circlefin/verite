import Ajv from "ajv"

import { CreditScoreAttestation, KYCAMLAttestation } from "../../types"
import { ValidationError } from "../errors"
export { findSchemaById } from "./schemas"

const ajv = new Ajv()

export function validateAttestationSchema(
  attestation: KYCAMLAttestation | CreditScoreAttestation,
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
