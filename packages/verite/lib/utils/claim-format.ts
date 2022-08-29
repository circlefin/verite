import { ClaimFormat, ClaimFormatDesignation, InputDescriptorConstraintField, InputDescriptorConstraintSubjectConstraint, PresentationDefinition } from "../../types"

// Note: tracking issue in PEx spec saying it must be UUID
export const PROOF_OF_CONTROL_PRESENTATION_DEF_ID =
  "ProofOfControlPresentationDefinition"


export function parseClaimFormat(d: ClaimFormatDesignation): ClaimFormat {
  const keys = Object.keys(d)
  if (!keys) {
    return ClaimFormat.JwtVc
  }
  const formatProperty = Object.keys(d)[0]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((<any>Object).values(ClaimFormat).includes(formatProperty)) {
    return formatProperty as ClaimFormat
  } else {
    throw TypeError("Unsupported format")
  }
}

export function schemaConstraint(schema: string) : InputDescriptorConstraintField {
  return {
    id: "credentialSchema",
    path: ["$.credentialSchema.id", "$.vc.credentialSchema.id"],
    filter: {
      type: "string",
      pattern: schema
    },
    purpose:
    "We need to ensure the credential conforms to the expected schema"
  }
}

export const subjectIsHolderConstraint: InputDescriptorConstraintSubjectConstraint[] =
  [
    {
      field_id: ["subjectId"],
      directive: "required"
    }
  ]

export const subjectIsHolderField: InputDescriptorConstraintField = {
  id: "subjectId",
  path: ["$.credentialSubject.id", "$.vc.credentialSubject.id", "$.id"],
  purpose:
    "We need to ensure the holder and the subject have the same identifier"
}

export function proofOfControlPresentationDefinition() : PresentationDefinition {
  return {
    id: PROOF_OF_CONTROL_PRESENTATION_DEF_ID,
    // which algorithms the Verifier supports for the input.
    format: {
      jwt_vp: {
        alg: ["EdDSA"]
      }
    },
    input_descriptors: [
      {
        id: "proofOfIdentifierControlVP",
        name: "Proof of Control Verifiable Presentation",
        purpose:
          "A VP establishing proof of identifier control over the DID.",
        constraints: {
          fields: [{
            id: "holder",
            path: ["$.holder"],
            purpose:
              "The VP should contain a DID in the holder, which is the same DID that signs the VP. This DID will be used as the subject of the issued VC"
          }]
        }
      }
    ]
  }
}