import {
  InputDescriptorConstraintField,
  InputDescriptorConstraintStatusDirective
} from "../../types/InputDescriptor"
import { PresentationDefinition } from "../../types/PresentationDefinition"
import { CREDENTIAL_SUBJECT_PROPERTY_NAME, CREDIT_SCORE_ATTESTATION, CREDIT_SCORE_CREDENTIAL_TYPE_NAME, CREDIT_SCORE_PRESENTATION_DEFINITION_TYPE_NAME, EDDSA, getAttestionInformation, KYCAML_ATTESTATION, KYCAML_CREDENTIAL_TYPE_NAME, KYCAML_PRESENTATION_DEFINITION_TYPE_NAME, schemaConstraint, subjectIsHolderConstraint, subjectIsHolderField } from "../utils"

/**
 * Build a Presentation Definition requesting a KYC/AML Attestation
 */
export function kycPresentationDefinition(
  trustedAuthorities: string[] = []
): PresentationDefinition {
  const requiredFields: Record<string, string> = {
    process: "string",
    approvalDate: "string"
  }

  const fields: InputDescriptorConstraintField[] = Object.keys(
    requiredFields
  ).map((key) => {
    return {
      path: [
        `$.${CREDENTIAL_SUBJECT_PROPERTY_NAME}.${KYCAML_ATTESTATION}.${key}`,
        `$.vc.${CREDENTIAL_SUBJECT_PROPERTY_NAME}.${KYCAML_ATTESTATION}.${key}`,
        `$.${KYCAML_ATTESTATION}.${key}`
      ],
      purpose: `The KYC/AML Attestation requires the field: '${key}'.`,
      predicate: "required",
      filter: {
        type: requiredFields[key]
      }
    }
  })

  fields.push(subjectIsHolderField)
  
  
  const attestationInfo = getAttestionInformation(KYCAML_ATTESTATION)
  const schema = schemaConstraint(attestationInfo.schema)
  fields.push(schema)

  if (trustedAuthorities.length > 0) {
    fields.push(trustedAuthorityConstraint(trustedAuthorities))
  }

  return {
    id: KYCAML_PRESENTATION_DEFINITION_TYPE_NAME,
    input_descriptors: [
      {
        id: KYCAML_CREDENTIAL_TYPE_NAME,
        name: "Proof of KYC",
        purpose: "Please provide a valid credential from a KYC/AML issuer",
        constraints: {
          statuses: {
            active: {
              directive: InputDescriptorConstraintStatusDirective.REQUIRED
            }
          },
          is_holder: subjectIsHolderConstraint,
          fields
        },
        format: {
          jwt_vp: {
            alg: [EDDSA]
          },
          jwt_vc: {
            alg: [EDDSA]
          }
        }
      }
    ]
  }
}

/**
 * Build a Presentation Definition requesting a Credit Score Attestation
 */
export function creditScorePresentationDefinition(
  trustedAuthorities: string[] = [],
  minimumCreditScore?: number
): PresentationDefinition {
  const requiredFields: Record<string, string> = {
    score: "number",
    scoreType: "string",
    provider: "string"
  }

  const fields: InputDescriptorConstraintField[] = Object.keys(
    requiredFields
  ).map((key) => {
    return {
      path: [
        `$.${CREDENTIAL_SUBJECT_PROPERTY_NAME}.${CREDIT_SCORE_ATTESTATION}.${key}`,
        `$.vc.${CREDENTIAL_SUBJECT_PROPERTY_NAME}.${CREDIT_SCORE_ATTESTATION}.${key}`,
        `$.${CREDIT_SCORE_ATTESTATION}.${key}`
      ],
      purpose: `The Credit Score Attestation requires the field: '${key}'.`,
      predicate: "required",
      filter: {
        type: requiredFields[key]
      }
    }
  })

  fields.push(subjectIsHolderField)

  const attestationInfo = getAttestionInformation(CREDIT_SCORE_ATTESTATION)
  const schema = schemaConstraint(attestationInfo.schema)
  fields.push(schema)

  if (trustedAuthorities.length > 0) {
    fields.push(trustedAuthorityConstraint(trustedAuthorities))
  }

  if (minimumCreditScore) {
    fields.push({
      path: [
        `$.${CREDENTIAL_SUBJECT_PROPERTY_NAME}.${CREDIT_SCORE_ATTESTATION}.score`,
        `$.vc.${CREDENTIAL_SUBJECT_PROPERTY_NAME}.${CREDIT_SCORE_ATTESTATION}.score`,
        `$.${CREDIT_SCORE_ATTESTATION}.score`
      ],
      purpose: `We can only verify Credit Score credentials that are above ${minimumCreditScore}.`,
      filter: {
        type: "number",
        minimum: minimumCreditScore
      }
    })
  }

  return {
    id: CREDIT_SCORE_PRESENTATION_DEFINITION_TYPE_NAME,
    input_descriptors: [
      {
        id: CREDIT_SCORE_CREDENTIAL_TYPE_NAME,
        name: "Proof of Credit Score",
        purpose: "Please provide a valid credential from a Credit Score issuer",
        constraints: {
          statuses: {
            active: {
              directive: InputDescriptorConstraintStatusDirective.REQUIRED
            }
          },
          is_holder: subjectIsHolderConstraint,
          fields
        },
        format: {
          jwt_vp: {
            alg: [EDDSA]
          },
          jwt_vc: {
            alg: [EDDSA]
          }
        }
      }
    ]
  }
}

/**
 * This constraint will enforce that the credential was issued by one of the
 * `trustedAuthorities`. Pattern matching is a simple regex, so we anchor the
 * DIDs to ensure it matches completely.
 *
 * Note that the inputs here are assumed to be Ethereum addresses. If you were
 * to accept arbitrary input, you would need better handling of the regex
 * pattern.
 */
function trustedAuthorityConstraint(
  trustedAuthorities: string[] = []
): InputDescriptorConstraintField {
  return {
    path: ["$.issuer.id", "$.issuer", "$.vc.issuer", "$.iss"],
    purpose: "We can only verify credentials attested by a trusted authority.",
    filter: {
      type: "string",
      pattern: trustedAuthorities.map((issuer) => `^${issuer}$`).join("|")
    }
  }
}
