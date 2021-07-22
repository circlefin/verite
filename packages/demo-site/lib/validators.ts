import {
  CredentialApplication,
  CredentialManifest,
  decodeVerifiablePresentation,
  InputDescriptor,
  PresentationDefinition,
  VerificationSubmission
} from "@centre/verity"
import Ajv from "ajv"
import { VerifiableCredential, VerifiablePresentation } from "did-jwt-vc"
import jsonpath from "jsonpath"
import { findSchemaById, vcSchema, vpSchema } from "./schemas"
import {
  AcceptedCredentialApplication,
  AcceptedVerificationSubmission,
  FieldMatch,
  Match,
  VerificationMatch,
  ValidationError,
  ValidationFailure
} from "types"

const ajv = new Ajv()

export function errorToValidationFailure(err: Error): ValidationFailure {
  return {
    status: 400,
    title: err.name,
    detail: err.message
  }
}

export function messageToVerificationFailure(
  message: string
): ValidationFailure {
  return {
    status: 400,
    title: "Validation Failure",
    detail: message
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ajvErrorToVerificationFailures(errors: any): ValidationFailure[] {
  const convertedErrors = errors.map((e) => {
    return {
      status: 400, // TODO
      title: `${e.keyword} json schema validation failure`,
      detail: `${e.dataPath ? e.dataPath : "input"} ${e.message}`,
      source: {
        path: e.dataPath
      },
      original: e
    }
  })
  return convertedErrors
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validateSchema(input: any, schema: any, errors: ValidationFailure[]): boolean {
  const validate = ajv.compile(schema)
  const valid = validate(input)
  if (!valid) {
    errors.push(...ajvErrorToVerificationFailures(validate.errors))
  }
  return valid as boolean
}

export function validateVc(
  vc: VerifiableCredential,
  errors: ValidationFailure[]
): boolean {
  return validateSchema(vc, vcSchema, errors)
}

export function validateVp(
  vp: VerifiablePresentation,
  errors: ValidationFailure[]
): boolean {
  return validateSchema(vp, vpSchema, errors)
}

export function validateInputDescriptors(
  creds: Map<string, VerifiableCredential[]>,
  descriptors: InputDescriptor[],
  errors: ValidationFailure[]
): Map<string, VerificationMatch[]> {
  return descriptors.reduce((map, descriptor) => {
    map[descriptor.id] = descriptor.schema.reduce((matches, obj) => {
      const candidates = creds[obj.uri]
      if (!candidates) return matches
      const credsAndMatches = candidates.reduce(
        (
          candidateAccumulator: VerificationMatch[],
          cred: VerifiableCredential
        ) => {
          const constraints = descriptor.constraints
          if (!constraints || !constraints.fields) {
            // no constraints
            candidateAccumulator.push({
              cred,
              fieldMatches: [
                {
                  field: null,
                  matches: [
                    {
                      path: "*",
                      matchedValue: "*"
                    }
                  ]
                }
              ]
            })
            return candidateAccumulator
          }
          // if it has a constraint, every field must have a match
          const fieldsAndMatches = constraints.fields.reduce(
            (fieldAccumulator, field) => {
              const matchResults = field.path.reduce(
                (matchAccumulator, path) => {
                  try {
                    const values = jsonpath.query(cred, path)
                    if (values.length !== 0) {
                      if (!field.filter) {
                        return matchAccumulator.concat({
                          path,
                          matchedValue: values[0]
                        })
                      }
                      const validateResult = ajv.validate(
                        field.filter,
                        values[0]
                      )
                      if (validateResult) {
                        return matchAccumulator.concat({
                          path,
                          matchedValue: values[0]
                        })
                      }
                    }
                  } catch (e) {
                    console.error(e)
                  }
                  // no match; return
                  return matchAccumulator
                },
                new Array<Match>()
              )
              if (matchResults.length !== 0) {
                fieldAccumulator.push({ field, matches: matchResults })
              }
              return fieldAccumulator
            },
            new Array<FieldMatch>()
          )
          if (fieldsAndMatches.length !== 0) {
            candidateAccumulator.push({
              cred,
              fieldMatches: fieldsAndMatches
            })
          }
          return candidateAccumulator
        },
        new Array<VerificationMatch>()
      )
      if (credsAndMatches.length === 0) {
        errors.push(
          messageToVerificationFailure(
            `No match found for input descriptor ${descriptor.id}`
          )
        )
      } else {
        matches.push(...credsAndMatches)
      }
      return matches
    }, new Array<VerificationMatch>())
    return map
  }, new Map<string, VerificationMatch[]>())
}

function mapInputsToDescriptors(
  submission: VerificationSubmission,
  definition: PresentationDefinition
) {
  return submission.presentation_submission.descriptor_map.reduce((map, d) => {
    const match = definition.input_descriptors.find((id) => id.id === d.id)
    const values = jsonpath.query(submission, d.path)
    map[match.schema[0].uri] = values
    return map
  }, new Map<string, VerifiableCredential[]>())
}

export async function tryAcceptVerificationSubmission(
  submission: VerificationSubmission,
  definition: PresentationDefinition,
  errors: ValidationFailure[]
): Promise<AcceptedVerificationSubmission> {
  const DEEP_SCHEMA_VALIDATION = false
  try {
    const decoded = await decodeVerifiablePresentation(submission.presentation)
    const converted = {
      presentation_submission: submission.presentation_submission,
      presentation: decoded.verifiablePresentation
    }

    // check conforms to VP schema: disabled for now
    if (DEEP_SCHEMA_VALIDATION) {
      if (!validateVp(decoded.payload, errors)) {
        throw new ValidationError("not a valid VP", errors)
      }
    }

    const mapped = mapInputsToDescriptors(converted, definition)

    // check conforms to expected schema: disabled for now
    if (DEEP_SCHEMA_VALIDATION) {
      Object.keys(mapped).map((key) => {
        const schema = findSchemaById(key)
        // TODO(kim)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const result = mapped[key].every((cred) => {
          validateSchema(cred.credentialSubject, schema, errors)
        })
      })
    }

    // check it has matches
    const matches = validateInputDescriptors(
      mapped,
      definition.input_descriptors,
      errors
    )

    return {
      ...converted,
      matches
    }
  } catch (err) {
    errors.push(errorToValidationFailure(err))
  }
}

export async function tryAcceptCredentialApplication(
  application: CredentialApplication,
  manifest: CredentialManifest,
  errors: ValidationFailure[]
): Promise<AcceptedCredentialApplication> {
  try {
    const decoded = await decodeVerifiablePresentation(application.presentation)
    const converted = {
      ...application,
      presentation: decoded.verifiablePresentation
    }

    const mapped = mapInputsToDescriptors(
      converted,
      manifest.presentation_definition
    )

    // check it has matches
    const matches: Map<string, VerificationMatch[]> = validateInputDescriptors(
      mapped,
      manifest.presentation_definition.input_descriptors,
      errors
    )
    const result: AcceptedCredentialApplication = {
      ...converted,
      matches
    }

    return result
  } catch (err) {
    errors.push(errorToValidationFailure(err))
  }
}
