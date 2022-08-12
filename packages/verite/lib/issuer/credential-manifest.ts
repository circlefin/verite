import {
  CREDIT_SCORE_ATTESTATION_MANIFEST_ID,
  KYCAML_ATTESTATION_MANIFEST_ID,
  CREDIT_SCORE_CREDENTIAL,
  KYCAML_ATTESTATION_CREDENTIAL,
} from "verite"

import { credentialTypeToAttestations } from "../utils"

import type {
  CredentialIssuer,
  CredentialManifest,
  EntityStyle,
  OutputDescriptor,
  PresentationDefinition,
} from "../../types"




// Note: tracking issue in PEx spec saying it must be UUID
export const PROOF_OF_CONTROL_PRESENTATION_DEF_ID =
  "ProofOfControlPresentationDefinition"

/**
 * Helper function for common properties between both KYC and Credit Score
 * Manifests.
 */
function buildManifest(
  manifestId: string,
  issuer: CredentialIssuer,
  outputDescriptors: OutputDescriptor[]
): CredentialManifest {
  const presentationDefinition: PresentationDefinition = {
    id: PROOF_OF_CONTROL_PRESENTATION_DEF_ID,
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
          "A Verifiable Presentation establishing proof of identifier control over the DID.",
        schema: [
          {
            uri: "https://verite.id/definitions/schemas/0.0.1/ProofOfControl"
          }
        ]
      }
    ]
  }

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
    presentation_definition: presentationDefinition
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
  const attestationInfo = credentialTypeToAttestations(KYCAML_ATTESTATION_CREDENTIAL)[0]
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
  const attestationInfo = credentialTypeToAttestations(CREDIT_SCORE_CREDENTIAL)[0]
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
