import {
  AcceptedCredentialApplication,
  AcceptedVerificationSubmission,
  CredentialApplication,
  CredentialManifest,
  decodeVerifiablePresentation,
  InputDescriptor,
  PresentationDefinition,
  VerificationError,
  VerificationObject,
  VerificationSubmission,
} from "@centre/verity"
import Ajv from "ajv"
import { VerifiableCredential, VerifiablePresentation } from "did-jwt-vc"
import jsonpath from "jsonpath"
import { findSchemaById, vcSchema, vpSchema } from "./schemas"

const ajv = new Ajv()

function validateSchema(input: any, schema: any, errors: any[]): boolean {
  const validate = ajv.compile(schema)
  const valid = validate(input)
  if (!valid) {
    errors.push(...convertAjvErrors(validate.errors))
  }
  return valid as boolean
}

export function validateVc(vc: VerifiableCredential, errors: any[]): boolean {
  return validateSchema(vc, vcSchema, errors)
}

export function validateVp(vp: VerifiablePresentation, errors: any[]): boolean {
  return validateSchema(vp, vpSchema, errors)
}

export function validateInputDescriptors(
  creds: Map<string, VerifiableCredential[]>,
  descriptors: InputDescriptor[],
  errors: any[]
): any {
  return descriptors.reduce((map, descriptor) => {
    map[descriptor.id] = descriptor.schema.reduce((matches, obj) => {
      const candidates = creds[obj.uri]
      if (!candidates) return matches
      const credsAndMatches = candidates.reduce(
        (candidateAccumulator, cred) => {
          const constraints = descriptor.constraints
          if (!constraints || !constraints.fields) {
            // no constraints
            candidateAccumulator.push({
              cred,
              fieldsAndMatches: {
                path: "*",
                matchedValue: "*"
              }
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
                []
              )
              if (matchResults.length !== 0) {
                fieldAccumulator.push({ field, matches: matchResults })
              }
              return fieldAccumulator
            },
            []
          )
          if (fieldsAndMatches.length !== 0) {
            candidateAccumulator.push({
              cred,
              fieldsAndMatches: fieldsAndMatches
            })
          }
          return candidateAccumulator // array of {cred, {path, matchedValue}}
        },
        []
      )
      if (credsAndMatches.length === 0) {
        errors.push({ descriptor, info: "not a damn thing found" }) // TODO
      } else {
        matches.push(...credsAndMatches)
      }
      return matches
    }, [])
    return map // map<descriptorId, matches>
  }, new Map())
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

export async function verifyVerificationSubmission(
  submission: VerificationSubmission,
  definition: PresentationDefinition,
  errors: any[]
): Promise<AcceptedVerificationSubmission> {
  const DEEP_SCHEMA_VALIDATION = false
  try {
    const decoded = await decodeVerifiablePresentation(submission.presentation)
    const converted = {
      presentation_submission: submission.presentation_submission,
      presentation: decoded.verifiablePresentation
    }

    if (DEEP_SCHEMA_VALIDATION) {
      if (!validateVp(decoded.payload, errors)) {
        throw new VerificationError("not a valid VP", errors)
      }
    }

    const mapped = mapInputsToDescriptors(converted, definition)
    // TODO: check conforms with expected schema
    if (DEEP_SCHEMA_VALIDATION) {
      Object.keys(mapped).map((key) => {
        const schema = findSchemaById(key)
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
    if (err instanceof VerificationError) {
      errors.push(...err.errors)
    } else {
      // TODO
      errors.push({
        descriptor: "unknown error during verification",
        info: "not a damn thing found"
      })
    }
  }
}

export async function verifyCredentialApplication(
  application: CredentialApplication,
  manifest: CredentialManifest,
  errors: any[]
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
    const matches = validateInputDescriptors(
      mapped,
      manifest.presentation_definition.input_descriptors,
      errors
    )

    return {
      ...converted,
      matches: matches
    }
  } catch (err) {
    if (err instanceof VerificationError) {
      errors.push(...err.errors)
    } else {
      // TODO
      errors.push({
        descriptor: "unknown error during verification",
        info: "not a damn thing found"
      })
    }
  }
}

function convertAjvErrors(errors): VerificationObject[] {
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
