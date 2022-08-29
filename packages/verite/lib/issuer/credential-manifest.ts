import { CREDIT_SCORE_ATTESTATION, CREDIT_SCORE_ATTESTATION_MANIFEST_ID, getAttestionInformation, KYCAML_ATTESTATION, KYCAML_ATTESTATION_MANIFEST_ID, proofOfControlPresentationDefinition, schemaConstraint, subjectIsHolderConstraint, subjectIsHolderField } from "../utils"

import type {
  CredentialIssuer,
  CredentialManifest,
  EntityStyle,
  OutputDescriptor
} from "../../types"

/**
 * Helper function for common properties between both KYC and Credit Score
 * Manifests.
 */
export function buildManifest(
  manifestId: string,
  issuer: CredentialIssuer,
  outputDescriptors: OutputDescriptor[]
): CredentialManifest { 

  return {
    id: manifestId,
    version: "0.1.0",
    issuer,
    format: {
      jwt_vc: {
        alg: ["EdDSA"]
      },
      jwt_vp: {
        alg: ["EdDSA"]
      }
    },
    output_descriptors: outputDescriptors,
    presentation_definition: proofOfControlPresentationDefinition()
  }
}

/**
 * Whether or not a manifest requires revocable credentials.
 */
export function requiresRevocableCredentials(
  manifest: CredentialManifest
): boolean {
  return manifest.id === KYCAML_ATTESTATION_MANIFEST_ID
}

/**
 * Generate a Credential Manifest for a KYC/AML Attestation.
 *
 * @param issuer The issuer for the credential
 * @param styles An optional list of styles to use for the credential
 *
 * @returns a Credential Manifest
 */
export function buildKycAmlManifest(
  issuer: CredentialIssuer,
  styles: EntityStyle = {}
): CredentialManifest {

  const attestationInfo = getAttestionInformation(KYCAML_ATTESTATION)
  const outputDescriptors: OutputDescriptor[] = [
    {
      id: "kycAttestationOutput",
      schema: [
        {
          uri: attestationInfo.schema
        }
      ],
      name: `Proof of KYC from ${issuer.name}`,
      description: `Attestation that ${issuer.name} has completed KYC/AML verification for this subject`,
      display: {
        title: {
          text: `${issuer.name} KYC Attestation`
        },
        subtitle: {
          path: ["$.approvalDate", "$.vc.approvalDate"],
          fallback: "Includes date of approval"
        },
        description: {
          text: "The KYC authority processes Know Your Customer and Anti-Money Laundering analysis, potentially employing a number of internal and external vendor providers."
        },
        properties: [
          {
            label: "Process",
            path: ["$.KYCAMLAttestation.process"],
            schema: { type: "string" }
          },
          {
            label: "Approved At",
            path: ["$.KYCAMLAttestation.approvalDate"],
            schema: {
              type: "string",
              format: "date-time"
            }
          }
        ]
      },
      styles
    }
  ]

  return buildManifest(
    KYCAML_ATTESTATION_MANIFEST_ID,
    issuer,
    outputDescriptors
  )
}

export function buildCreditScoreManifest(
  issuer: CredentialIssuer,
  styles: EntityStyle = {}
): CredentialManifest {
  const attestationInfo = getAttestionInformation(CREDIT_SCORE_ATTESTATION)
  const outputDescriptors: OutputDescriptor[] = [
    {
      id: "creditScoreAttestationOutput",
      schema: [
        {
          uri: attestationInfo.schema
        }
      ],
      name: `Proof of Credit Score from ${issuer.name}`,
      description: `Attestation that ${issuer.name} has performed a Credit Score check for this subject`,
      display: {
        title: {
          text: `${issuer.name} Risk Score`
        },
        subtitle: {
          path: ["$.CreditScoreAttestation.scoreType"],
          fallback: "Includes credit score"
        },
        description: {
          text: "The Credit Score authority processes credit worthiness analysis, potentially employing a number of internal and external vendor providers."
        },
        properties: [
          {
            label: "Score",
            path: ["$.CreditScoreAttestation.score"],
            schema: {
              type: "number"
            }
          },
          {
            label: "Score Type",
            path: ["$.CreditScoreAttestation.scoreType"],
            schema: {
              type: "string"
            }
          },
          {
            label: "Provider",
            path: ["$.CreditScoreAttestation.provider"],
            schema: {
              type: "string"
            }
          }
        ]
      },
      styles
    }
  ]

  return buildManifest(
    CREDIT_SCORE_ATTESTATION_MANIFEST_ID,
    issuer,
    outputDescriptors
  )
}
