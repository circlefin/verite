import {
  InputDescriptorConstraintField,
  InputDescriptorConstraintStatusDirective,
  InputDescriptorConstraintSubjectConstraint,
  InputDescriptorConstraintSubjectConstraintDirective
} from "../../types/InputDescriptor"
import { PresentationDefinition } from "../../types/PresentationDefinition"

const subjectIsHolderConstraint: InputDescriptorConstraintSubjectConstraint[] =
  [
    {
      field_id: ["subjectId"],
      directive: InputDescriptorConstraintSubjectConstraintDirective.REQUIRED
    }
  ]

const subjectIsHolderField: InputDescriptorConstraintField = {
  id: "subjectId",
  path: ["$.credentialSubject.id", "$.vc.credentialSubject.id", "$.id"],
  purpose:
    "We need to ensure the holder and the subject have the same identifier"
}

/**
 * Build a Presentation Definition requesting a KYC/AML Attestation
 */
export function kycPresentationDefinition(
  trustedAuthorities: string[] = []
): PresentationDefinition {
  const requiredFields: Record<string, string> = {
    authorityId: "string",
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
        schema: [
          {
            uri: "https://verity.id/schemas/identity/1.0.0/KYCAMLAttestation",
            required: true
          }
        ],
        constraints: {
          statuses: {
            active: {
              directive: InputDescriptorConstraintStatusDirective.REQUIRED
            }
          },
          is_holder: subjectIsHolderConstraint,
          fields
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
        schema: [
          {
            uri: "https://verity.id/schemas/identity/1.0.0/CreditScoreAttestation",
            required: true
          }
        ],
        constraints: {
          statuses: {
            active: {
              directive: InputDescriptorConstraintStatusDirective.REQUIRED
            }
          },
          is_holder: subjectIsHolderConstraint,
          fields
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
