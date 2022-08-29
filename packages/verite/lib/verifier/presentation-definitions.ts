import {
  InputDescriptorConstraintField,
  InputDescriptorConstraintStatusDirective
} from "../../types/InputDescriptor"
import { PresentationDefinition } from "../../types/PresentationDefinition"
import { schemaConstraint, subjectIsHolderConstraint, subjectIsHolderField } from "../utils"



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
        `$.credentialSubject.KYCAMLAttestation.${key}`,
        `$.vc.credentialSubject.KYCAMLAttestation.${key}`,
        `$.KYCAMLAttestation.${key}`
      ],
      purpose: `The KYC/AML Attestation requires the field: '${key}'.`,
      predicate: "required",
      filter: {
        type: requiredFields[key]
      }
    }
  })

  fields.push(subjectIsHolderField)

  const schema = schemaConstraint("https://verite.id/definitions/schemas/0.0.1/KYCAMLAttestation")
  fields.push(schema)

  if (trustedAuthorities.length > 0) {
    fields.push(trustedAuthorityConstraint(trustedAuthorities))
  }

  return {
    id: "KYCAMLPresentationDefinition",
    input_descriptors: [
      {
        id: "kycaml_input",
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
            alg: ["EdDSA"]
          },
          jwt_vc: {
            alg: ["EdDSA"]
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
        `$.credentialSubject.CreditScoreAttestation.${key}`,
        `$.vc.credentialSubject.CreditScoreAttestation.${key}`,
        `$.CreditScoreAttestation.${key}`
      ],
      purpose: `The Credit Score Attestation requires the field: '${key}'.`,
      predicate: "required",
      filter: {
        type: requiredFields[key]
      }
    }
  })

  fields.push(subjectIsHolderField)

  const schema = schemaConstraint("https://verite.id/definitions/schemas/0.0.1/CreditScoreAttestation")
  fields.push(schema)

  if (trustedAuthorities.length > 0) {
    fields.push(trustedAuthorityConstraint(trustedAuthorities))
  }

  if (minimumCreditScore) {
    fields.push({
      path: [
        "$.credentialSubject.CreditScoreAttestation.score",
        "$.vc.credentialSubject.CreditScoreAttestation.score",
        "$.CreditScoreAttestation.score"
      ],
      purpose: `We can only verify Credit Score credentials that are above ${minimumCreditScore}.`,
      filter: {
        type: "number",
        minimum: minimumCreditScore
      }
    })
  }

  return {
    id: "CreditScorePresentationDefinition",
    input_descriptors: [
      {
        id: "creditScore_input",
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
            alg: ["EdDSA"]
          },
          jwt_vc: {
            alg: ["EdDSA"]
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
