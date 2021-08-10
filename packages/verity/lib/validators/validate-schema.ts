import Ajv from "ajv"
import { ValidationFailure } from "../../types/Validation"
import { Verifiable, W3CCredential, W3CPresentation } from "../../types/W3C"
import { ValidationError } from "../errors"

const ajv = new Ajv()

export function validateSchema(
  input: Verifiable<W3CCredential | W3CPresentation>,
  schema: Record<string, unknown>,
  errors: ValidationFailure[]
): boolean {
  const validate = ajv.compile(schema)
  const valid = validate(input)
  if (!valid) {
    errors.push(...ajvErrorToVerificationFailures(validate.errors))
  }
  return valid as boolean
}

function ajvErrorToVerificationFailures(
  errors?: Ajv.ErrorObject[] | null
): ValidationError[] {
  if (!errors) {
    return []
  }

  const convertedErrors = errors.map((e) => {
    return new ValidationError(
      `${e.keyword} json schema validation failure`,
      `${e.dataPath ? e.dataPath : "input"} ${e.message}`
    )
  })

  return convertedErrors
}
