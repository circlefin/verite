import Ajv from "ajv"
import jsonpath from "jsonpath"
import { compact } from "lodash"
import type {
  InputDescriptor,
  PresentationDefinition,
  W3CCredential,
  Verifiable,
  DecodedVerificationSubmission
} from "../../types"
import { ValidationError, ValidationErrorArray } from "../errors"

const ajv = new Ajv()

/**
 * Validate a presentation submission against the presentation definition.
 */
export function validatePresentationSubmission(
  submission?: DecodedVerificationSubmission,
  definition?: PresentationDefinition
): void {
  if (!submission || !definition) {
    return
  }

  validateInputDescriptors(
    mapInputsToDescriptors(submission, definition),
    definition.input_descriptors
  )
}

/**
 * Convert an Ajv.ErrorObject to a ValidationError
 */
function ajvErrorToValidationError(e: Ajv.ErrorObject): ValidationError {
  return new ValidationError(
    `${e.keyword} json schema validation failure`,
    `${e.dataPath ? e.dataPath : "input"} ${e.message}`
  )
}

/**
 * Find the first value in a credential that matches a path in the given
 * array. The first matching value is returned.
 *
 * Per the DIF Presentation Exchange spec:
 * > The array MUST be evaluated from 0-index forward, and the first expressions
 * > to return a value will be used for the rest of the entry’s evaluation.
 * https://identity.foundation/presentation-exchange/
 */
function findFirstValueForPaths(
  credential: Verifiable<W3CCredential>,
  paths: string[]
): unknown {
  for (const path of paths) {
    const data = jsonpath.query(credential, path)[0]

    if (data) {
      return data
    }
  }
}

/**
 * Validate a single credential against the input descriptor.
 *
 * @throws a Validation Error if any errors are found
 */
function validateCredentialAgainstInputDescriptor(
  credential: Verifiable<W3CCredential>,
  descriptor: InputDescriptor
): ValidationError[] {
  const constraints = descriptor.constraints

  // No constraints, bail
  if (!constraints || !constraints.fields) {
    return []
  }

  return compact(
    constraints.fields.flatMap((field) => {
      if (!field.filter) {
        return
      }

      // Find the first value in the credential that matches a path in the field
      const matchingValue = findFirstValueForPaths(credential, field.path)

      // Validate that value against the filter
      if (!ajv.validate(field.filter, matchingValue)) {
        return ajv.errors?.map(ajvErrorToValidationError)
      }
    })
  )
}

/**
 * Validate all provided credentials against the input descriptors.
 *
 * @throws an array of ValidationError if any errors are found
 */
function validateInputDescriptors(
  creds: Map<string, Verifiable<W3CCredential>[]>,
  descriptors?: InputDescriptor[]
): void {
  if (!descriptors || !descriptors.length || !creds.size) {
    return
  }

  const errors = compact(
    descriptors.flatMap((descriptor) => {
      return descriptor.schema.flatMap((schema) => {
        const credentials = creds.get(schema.uri)

        if (!credentials) {
          return []
        }

        return credentials.flatMap((credential) =>
          validateCredentialAgainstInputDescriptor(credential, descriptor)
        )
      })
    })
  )

  if (errors.length) {
    throw new ValidationErrorArray(errors)
  }
}

function mapInputsToDescriptors(
  submission: DecodedVerificationSubmission,
  definition: PresentationDefinition
) {
  const result = new Map<string, Verifiable<W3CCredential>[]>()

  if (!definition || !submission.presentation_submission) {
    return result
  }

  return submission.presentation_submission.descriptor_map.reduce((map, d) => {
    const match = definition.input_descriptors.find((id) => id.id === d.id)

    if (match) {
      const credentials = jsonpath.query(submission, d.path)
      map.set(match.schema[0].uri, credentials)
    }

    return map
  }, result)
}
