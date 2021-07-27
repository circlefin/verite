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
import { vcSchema, vpSchema } from "./schemas"

import {
  FieldConstraintEvaluation,
  PathEvaluation,
  ProcessedCredentialApplication,
  ProcessedVerificationSubmission,
  Reporter,
  InputDescriptorEvaluation,
  ValidationFailure,
  CredentialEvaluation
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

function validateSchema(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  input: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: any,
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
  descriptors: InputDescriptor[]
): InputDescriptorEvaluation[] {
  return descriptors.map((descriptor) => {
    const credResults = descriptor.schema.reduce((matches, obj) => {
      const candidates = creds[obj.uri]
      matches = !candidates
        ? matches
        : matches.concat(
            candidates.map((cred) => {
              const constraints = descriptor.constraints
              if (!constraints || !constraints.fields) {
                return new CredentialEvaluation(constraints, null, null, cred)
              }
              const fieldChecks = new Array<FieldConstraintEvaluation>()
              let failed = false
              for (const field of constraints.fields) {
                const pathEvaluations = new Array<PathEvaluation>()
                const pathMatch = field.path.some((path) => {
                  try {
                    const values = jsonpath.query(cred, path)
                    const hasMatch =
                      values.length === 0
                        ? false
                        : !field.filter || ajv.validate(field.filter, values[0])
                    pathEvaluations.push({
                      path,
                      value: values.length > 0 ? values[0] : null
                    })
                    return hasMatch as boolean
                  } catch (err) {
                    console.log(err)
                    pathEvaluations.push({path, value: null})
                    return false
                  }
                })
                const match = pathMatch
                  ? pathEvaluations[pathEvaluations.length - 1]
                  : null
                const failures = pathMatch ? null : pathEvaluations
                fieldChecks.push(
                  new FieldConstraintEvaluation(field, match, failures)
                )
                // all field checks must pass; quit early
                if (!pathMatch) {
                  failed = true
                  break
                }
              }
              return new CredentialEvaluation(
                constraints,
                failed ? null : fieldChecks,
                failed
                  ? fieldChecks[ajvErrorToVerificationFailures.length - 1]
                  : null,
                cred
              )
            })
          )
      return matches
    }, [])
    return new InputDescriptorEvaluation(descriptor.id, credResults)
  })
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

export async function processVerificationSubmission(
  submission: VerificationSubmission,
  definition: PresentationDefinition
): Promise<ProcessedVerificationSubmission> {
  const decoded = await decodeVerifiablePresentation(submission.presentation)
  const converted = {
    presentation_submission: submission.presentation_submission,
    presentation: decoded.verifiablePresentation
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
    new Reporter(evaluations),
    converted.presentation_submission
  )
}

export async function processCredentialApplication(
  application: CredentialApplication,
  manifest: CredentialManifest
): Promise<ProcessedCredentialApplication> {
  const decoded = await decodeVerifiablePresentation(application.presentation)
  const converted = {
    ...application,
    presentation: decoded.verifiablePresentation
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
    new Reporter(evaluations),
    converted.presentation_submission
  )
}
