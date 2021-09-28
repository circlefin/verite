import Ajv from "ajv"
import { VerifyPresentationOptions } from "did-jwt-vc/lib/types"
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
  InputDescriptorConstraintField
} from "../../types"
import { ValidationError } from "../errors"
import { isRevoked } from "../issuer"
import { asyncSome, decodeVerifiablePresentation, isExpired } from "../utils"
import { findSchemaById, validateAttestationSchema } from "./validate-schema"

const ajv = new Ajv()

/**
 * Find the first path in the input descriptor field which is present in the
 * credential.
 */
function findFirstMatchingPathForField(
  field: InputDescriptorConstraintField,
  credential: Verifiable<W3CCredential>
): unknown | undefined {
  for (const path of field.path) {
    const value = jsonpath.query(credential, path)
    if (value.length) {
      return value[0]
    }
  }
}

/**
 * Validate a credential against a given input descriptor field constraints
 */
function validateField(
  field: InputDescriptorConstraintField,
  credential: Verifiable<W3CCredential>
): boolean {
  const value = findFirstMatchingPathForField(field, credential)
  if (!value) {
    // FAIL, no matching paths
    return false
  }

  if (!field.filter) {
    // PASS, no filter. Anything is valid
    return true
  }

  ajv.validate(field.filter, value)
  return !ajv.errors
}

/**
 * Validate all input descriptors against their constraints in the
 * verification request presentation definition
 */
function validateInputDescriptors(
  credentialMap: Map<string, Verifiable<W3CCredential>[]>,
  descriptors?: InputDescriptor[]
): void {
  if (!descriptors) {
    // no input descriptors, so there is nothing to validate
    return
  }

  // iterate over all input descriptors to find the relevant credentials
  descriptors.forEach((descriptor) => {
    const constraints = descriptor.constraints
    const fields = constraints?.fields

    if (!constraints || !fields || !fields.length) {
      // no constraints on this descriptor, so everything is valid
      return
    }

    // iterate over all schemas in the descriptor
    descriptor.schema.forEach((schema) => {
      const credentials = credentialMap.get(schema.uri)

      if (!credentials || !credentials.length) {
        // no credentials found for this schema, nothing to validate
        return
      }

      credentials.forEach((credential) => {
        // iterate over each field in the constraint and validate it against
        // the credential.
        fields.forEach((field) => {
          if (!validateField(field, credential)) {
            throw new ValidationError(
              `Credential failed to meet criteria specified by input descriptor ${descriptor.id}`,
              `Credential did not match constraint: ${field.purpose}`
            )
          }
        })
      })
    })
  })
}

/**
 * Generate a mapping from input descriptors to to a list of all matching
 * credentials from the submission.
 */
function mapInputsToDescriptors(
  submission: DecodedVerificationSubmission | DecodedCredentialApplication,
  definition?: PresentationDefinition
): Map<string, Verifiable<W3CCredential>[]> {
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
      "Revoked Credential",
      "The selected verified credential has been revoked"
    )
  }
}

/**
 * Ensure all credentials in a verifiable presentation are not expired
 */
function ensureNotExpired(presentation: Verifiable<W3CPresentation>): void {
  const credentials = presentation.verifiableCredential || []

  const anyExpired = credentials.some((credential) => isExpired(credential))

  if (anyExpired) {
    throw new ValidationError(
      "Expired Credential",
      "The selected verified credential has expired"
    )
  }
}

function validateCredentialAgainstSchema(
  credentialMap: Map<string, Verifiable<W3CCredential>[]>
): void {
  credentialMap.forEach((credentials, uri) => {
    const schema = findSchemaById(uri)

    if (!schema) {
      throw new ValidationError(`Unknown schema: ${uri}`)
    }

    credentials.forEach((credential) => {
      const type = credential.type[credential.type.length - 1]
      validateAttestationSchema(credential.credentialSubject[type], schema)
    })
  })
}

async function ensureHolderIsSubject(
  presentation: Verifiable<W3CPresentation>
): Promise<void> {
  if (!presentation.verifiableCredential) {
    throw new ValidationError("No Credential", "No Verifiable Credential Given")
  }

  const holder = presentation.holder
  const subject = presentation.verifiableCredential[0].credentialSubject.id
  if (holder !== subject) {
    throw new ValidationError(
      "Signing Error",
      "Presentation is not signed by the subject."
    )
  }
}

/**
 * Validate a verifiable presentation against a presentation definition
 */
export async function validateVerificationSubmission(
  submission: EncodedVerificationSubmission,
  definition: PresentationDefinition,
  options?: VerifyPresentationOptions
): Promise<void> {
  const presentation = await decodeVerifiablePresentation(
    submission.presentation,
    options
  )

  const decoded: DecodedVerificationSubmission = {
    presentation_submission: submission.presentation_submission,
    presentation
  }

  /**
   * Check that the Verified Presentation was signed by the subject of the
   * Verified Credential. This ensures that the person submitting the
   * Presentation is the credential subject.
   */
  await ensureHolderIsSubject(presentation)

  /**
   * Check the verifiable credentials to ensure non are revoked. To check
   * revocation status, we must either have a local cached copy of the revocation
   * list, or fetch the list from the location described in the credential.
   */
  await ensureNotRevoked(presentation)

  /**
   * Check the verifiable credentials to ensure none are expired. Generally,
   * the JWT verification itself would handle this by checking the `exp` field
   * of the JWT, but those JWT properties are only checked on the Presentation
   * JWT, and not on the included credentials themselves.
   *
   * To ensure we do not use any expired credentials, we check this ourselves
   * here.
   */
  ensureNotExpired(presentation)

  const credentialMap = mapInputsToDescriptors(decoded, definition)

  /**
   * Check the verifiable credentials to ensure they meet the requirements
   * set forward in the verification request. This check will generally ensure
   * the credential is signed by a trusted signer, and meets the minimum
   * requirements set forth in the request (e.g. minimum credit score).
   */
  validateInputDescriptors(credentialMap, definition.input_descriptors)

  /**
   * Validate that each credential matches the expected schema
   */
  validateCredentialAgainstSchema(credentialMap)
}
