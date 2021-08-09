import Ajv from "ajv"
import jsonpath from "jsonpath"
import type {
  CredentialManifest,
  DecodedVerificationSubmission,
  InputDescriptor,
  PresentationDefinition,
  EncodedVerificationSubmission,
  DecodedCredentialApplication,
  EncodedCredentialApplication,
  W3CCredential,
  W3CPresentation,
  Verifiable,
  RevocableCredential,
  PathEvaluation
} from "../../types"
import { decodeCredentialApplication } from "../credential-application-fns"
import { ValidationError } from "../errors"
import { isRevoked } from "../issuer"
import { asyncSome, decodeVerifiablePresentation } from "../utils"
import {
  CredentialResults,
  FieldConstraintEvaluation,
  ValidationCheck
} from "./Matches"
import { ProcessedCredentialApplication } from "./ProcessedCredentialApplication"
import { ProcessedVerificationSubmission } from "./ProcessedVerificationSubmission"

const ajv = new Ajv()

export function validateInputDescriptors(
  creds: Map<string, Verifiable<W3CCredential>[]>,
  descriptors?: InputDescriptor[]
): ValidationCheck[] {
  if (!descriptors) {
    return []
  }

  return descriptors.reduce((map, descriptor) => {
    const credentialResults = descriptor.schema.reduce((matches, obj) => {
      const candidates = creds.get(obj.uri)

      if (!candidates) {
        return matches
      }

      return matches.concat(
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
                  (values.length > 0 && ajv.validate(field.filter, values[0]))
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
            const match = pathMatch ? pathEvaluations.slice(-1)[0] : undefined
            fieldChecks.push(
              new FieldConstraintEvaluation(
                field,
                match,
                pathMatch ? undefined : pathEvaluations
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
    }, new Array<CredentialResults>())

    return map.concat(new ValidationCheck(descriptor.id, credentialResults))
  }, new Array<ValidationCheck>())
}

function mapInputsToDescriptors(
  submission: DecodedVerificationSubmission | DecodedCredentialApplication,
  definition?: PresentationDefinition
) {
  const result = new Map<string, Verifiable<W3CCredential>[]>()
  if (!definition || !submission.presentation_submission) {
    return result
  }

  return submission.presentation_submission.descriptor_map.reduce((map, d) => {
    const match = definition.input_descriptors.find((id) => id.id === d.id)
    if (!match) {
      return map
    }

    const values = jsonpath.query(submission, d.path)
    map.set(match.schema[0].uri, values)
    return map
  }, result)
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

  await ensureNotRevoked(presentation)

  return new ProcessedVerificationSubmission(
    converted.presentation,
    evaluations,
    converted.presentation_submission
  )
}

async function ensureNotRevoked(
  presentation: Verifiable<W3CPresentation>
): Promise<void> {
  const credentials =
    (presentation.verifiableCredential as RevocableCredential[]) || []

  const anyRevoked = await asyncSome(credentials, async (credential) => {
    return isRevoked(credential)
  })

  if (anyRevoked) {
    throw new ValidationError(
      "Revoked Credentials",
      "At least one of the provided verified credential have been revoked"
    )
  }
}

export async function processCredentialApplication(
  application: EncodedCredentialApplication,
  manifest: CredentialManifest
): Promise<ProcessedCredentialApplication> {
  const decoded = await decodeCredentialApplication(application)

  const mapped = mapInputsToDescriptors(
    decoded,
    manifest.presentation_definition
  )

  const evaluations = validateInputDescriptors(
    mapped,
    manifest.presentation_definition?.input_descriptors
  )

  return new ProcessedCredentialApplication(
    decoded.credential_application,
    decoded.presentation,
    evaluations,
    decoded.presentation_submission
  )
}
