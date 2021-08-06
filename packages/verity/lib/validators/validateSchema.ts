import Ajv from "ajv"
import { Verifiable, W3CCredential, W3CPresentation } from "../../types/W3C"
import { ValidationError } from "../errors"
import vcSchema from "./schemas/vc-schema.json"
import vpSchema from "./schemas/vp-schema.json"

/**
 * Validate an input against a provided JSON schema
 *
 * @throws a ValidationError on failure
 */
function validateSchema(
  input: Verifiable<W3CCredential | W3CPresentation>,
  schema: Record<string, unknown>
): void {
  const ajv = new Ajv()
  const validate = ajv.compile(schema)
  const valid = validate(input)

  if (!valid && validate.errors) {
    const errorMessages = validate.errors
      .map(
        (e) => `${e.keyword}: ${e.dataPath ? e.dataPath : "input"} ${e.message}`
      )
      .join(", ")

    throw new ValidationError("Invalid JSON Schema", errorMessages)
  }
}

/**
 * Validate a VerifiableCredential against the W3C schema
 *
 * @throws a ValidationError on failure
 */
export function validateVcSchema(vc: Verifiable<W3CCredential>): void {
  return validateSchema(vc, vcSchema)
}

/**
 * Validate a VerifiablePresentation against the W3C schema
 *
 * @throws a ValidationError on failure
 */
export function validateVpSchema(vp: Verifiable<W3CPresentation>): void {
  return validateSchema(vp, vpSchema)
}
