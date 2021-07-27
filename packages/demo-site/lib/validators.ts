import {
  CredentialManifest,
  DecodedVerificationSubmission,
  decodeVerifiablePresentation,
  InputDescriptor,
  PresentationDefinition,
  EncodedVerificationSubmission,
  DecodedCredentialApplication,
  EncodedCredentialApplication,
  W3CCredential,
  W3CPresentation,
  Verifiable
} from "@centre/verity"
import Ajv from "ajv"
import jsonpath from "jsonpath"
import { vcSchema, vpSchema } from "./schemas"

import {
  ProcessedCredentialApplication,
  ProcessedVerificationSubmission,
  ValidationCheck,
  ValidationFailure,
  FieldConstraintEvaluation,
  PathEvaluation,
  CredentialResults
} from "types"

const ajv = new Ajv()

export function errorToValidationFailure(err: Error): ValidationFailure {
  return {
    status: 400,
    message: err.name,
    details: err.message
  }
}

export function messageToValidationFailure(message: string): ValidationFailure {
  return {
    status: 400,
    message: "Validation Failure",
    details: message
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
function validateSchema(
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

export function validateVc(
  vc: Verifiable<W3CCredential>,
  errors: ValidationFailure[]
): boolean {
  return validateSchema(vc, vcSchema, errors)
}

export function validateVp(
  vp: Verifiable<W3CPresentation>,
  errors: ValidationFailure[]
): boolean {
  return validateSchema(vp, vpSchema, errors)
}

export function validateInputDescriptors(
  creds: Map<string, Verifiable<W3CCredential>[]>,
  descriptors: InputDescriptor[]
): ValidationCheck[] {
  return descriptors.reduce((map, descriptor) => {
    const credentialResults = descriptor.schema.reduce((matches, obj) => {
      const candidates = creds[obj.uri]
      matches = !candidates
        ? matches
        : matches.concat(
            candidates.map((cred) => {
              const constraints = descriptor.constraints
              if (!constraints || !constraints.fields) {
                return new CredentialResults(cred, [])
              }

              const fieldChecks = new Array<FieldConstraintEvaluation>()
              for (const field of constraints.fields) {
                const pathEvaluations = new Array<PathEvaluation>()
                const pathMatch = field.path.some((path) => {
                  try {
                    const values = jsonpath.query(cred, path)
                    const hasMatch =
                      !field.filter ||
                      (values.length > 0 &&
                        ajv.validate(field.filter, values[0]))
                    pathEvaluations.push({
                      path,
                      match: hasMatch as boolean,
                      value: values.length > 0 ? values[0] : null
                    })
                    return hasMatch as boolean
                  } catch (err) {
                    console.log(err)
                    pathEvaluations.push({ path, match: false, value: null })
                    return false
                  }
                })
                const match = pathMatch ? pathEvaluations.slice(-1)[0] : null
                fieldChecks.push(
                  new FieldConstraintEvaluation(
                    field,
                    match,
                    pathMatch ? null : pathEvaluations
                  )
                )
                // all field checks must pass; quit early
                if (!pathMatch) {
                  break
                }
              }
              return new CredentialResults(cred, fieldChecks)
            })
          )
      return matches
    }, [])
    map.push(new ValidationCheck(descriptor.id, credentialResults))
    return map
  }, new Array<ValidationCheck>())
}

function mapInputsToDescriptors(
  submission: DecodedVerificationSubmission,
  definition: PresentationDefinition
) {
  return submission.presentation_submission.descriptor_map.reduce((map, d) => {
    const match = definition.input_descriptors.find((id) => id.id === d.id)
    const values = jsonpath.query(submission, d.path)
    map[match.schema[0].uri] = values
    return map
  }, new Map<string, Verifiable<W3CCredential>[]>())
}

export async function processVerificationSubmission(
  submission: EncodedVerificationSubmission,
  definition: PresentationDefinition
): Promise<ProcessedVerificationSubmission> {
  const presentation = await decodeVerifiablePresentation(
    submission.presentation
  )
  const converted: DecodedVerificationSubmission = {
    presentation_submission: submission.presentation_submission,
    presentation
  }

  const mapped = mapInputsToDescriptors(converted, definition)

  // check conforms to expected schema: disabled for now
  /*
    Object.keys(mapped).map((key) => {
      const schema = findSchemaById(key)
      // TODO(kim)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const result = mapped[key].every((cred) => {
        validateSchema(cred.credentialSubject, schema, errors)
      })
    })
  */

  const evaluations = validateInputDescriptors(
    mapped,
    definition.input_descriptors
  )
  return new ProcessedVerificationSubmission(
    converted.presentation,
    evaluations,
    converted.presentation_submission
  )
}

export async function processCredentialApplication(
  application: EncodedCredentialApplication,
  manifest: CredentialManifest
): Promise<ProcessedCredentialApplication> {
  const presentation = await decodeVerifiablePresentation(
    application.presentation
  )
  const converted: DecodedCredentialApplication = {
    ...application,
    presentation
  }

  const mapped = mapInputsToDescriptors(
    converted,
    manifest.presentation_definition
  )

  const evaluations = validateInputDescriptors(
    mapped,
    manifest.presentation_definition.input_descriptors
  )

  return new ProcessedCredentialApplication(
    converted.credential_application,
    converted.presentation,
    evaluations,
    converted.presentation_submission
  )
}
