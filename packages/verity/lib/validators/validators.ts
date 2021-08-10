import Ajv from "ajv"
import jsonpath from "jsonpath"
import type {
  DecodedVerificationSubmission,
  InputDescriptor,
  PresentationDefinition,
  EncodedVerificationSubmission,
  DecodedCredentialApplication,
  W3CCredential,
  W3CPresentation,
  Verifiable,
  PathEvaluation
} from "../../types"
import { ValidationError } from "../errors"
import { isRevoked } from "../issuer"
import { asyncSome, decodeVerifiablePresentation } from "../utils"
import {
  CredentialResults,
  FieldConstraintEvaluation,
  ValidationCheck
} from "./Matches"
import { ProcessedVerificationSubmission } from "./ProcessedVerificationSubmission"

const ajv = new Ajv()

function validateInputDescriptors(
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
  const descriptorMap = submission.presentation_submission?.descriptor_map || []

  return descriptorMap.reduce((map, d) => {
    const match = definition?.input_descriptors.find((id) => id.id === d.id)

    if (!match) {
      return map
    }

    const credentials = jsonpath.query(submission, d.path)
    return map.set(match.schema[0].uri, credentials)
  }, new Map<string, Verifiable<W3CCredential>[]>())
}

/**
 * Validate a verifiable presentation against a presentation definition
 */
export async function processVerificationSubmission(
  submission: EncodedVerificationSubmission,
  definition: PresentationDefinition
): Promise<ProcessedVerificationSubmission> {
  const presentation = await decodeVerifiablePresentation(
    submission.presentation
  )

  const decoded: DecodedVerificationSubmission = {
    presentation_submission: submission.presentation_submission,
    presentation
  }

  await ensureNotRevoked(presentation)

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
    mapInputsToDescriptors(decoded, definition),
    definition.input_descriptors
  )

  return new ProcessedVerificationSubmission(
    decoded.presentation,
    evaluations,
    decoded.presentation_submission
  )
}

/**
 * Ensure all credentials in a verifiable presentation are not revoked
 */
async function ensureNotRevoked(
  presentation: Verifiable<W3CPresentation>
): Promise<void> {
  const anyRevoked = await asyncSome(
    presentation.verifiableCredential || [],
    async (credential) => {
      return isRevoked(credential)
    }
  )

  if (anyRevoked) {
    throw new ValidationError(
      "Revoked Credentials",
      "At least one of the provided verified credential have been revoked"
    )
  }
}
