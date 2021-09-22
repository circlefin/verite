import { VerifyPresentationOptions } from "did-jwt-vc/lib/types"
import type {
  EncodedCredentialApplication,
  GenericCredentialApplication,
  DecodedCredentialApplication,
  CredentialIssuer,
  CredentialManifest,
  EntityStyle,
  OutputDescriptor,
  PresentationDefinition
} from "../../types"
import { decodeVerifiablePresentation } from "../utils"

export const CREDIT_SCORE_ATTESTATION_MANIFEST_ID = "CreditScoreAttestation"
export const KYCAML_ATTESTATION_MANIFEST_ID = "KYCAMLAttestation"
// Note: tracking issue in PEx spec saying it must be UUID
export const PROOF_OF_CONTROL_PRESENTATION_DEF_ID =
  "ProofOfControlPresentationDefinition"

/**
 * Helper function for common properties between both KYC and Credit Score
 * Manifests.
 */
function createManifest(
  manifestId: string,
  issuer: CredentialIssuer,
  outputDescriptors: OutputDescriptor[]
): CredentialManifest {
  const presentationDefinition: PresentationDefinition = {
    id: PROOF_OF_CONTROL_PRESENTATION_DEF_ID,
    format: {
      jwt_vp: {
        alg: ["EdDSA", "ES256K"]
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
            uri: "/.well-known/verifiablePresentationSchema.json"
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
        alg: ["EdDSA", "ES256K"]
      },
      jwt_vp: {
        alg: ["EdDSA", "ES256K"]
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

export function createKycAmlManifest(
  issuer: CredentialIssuer,
  styles: EntityStyle = {}
): CredentialManifest {
  const outputDescriptors: OutputDescriptor[] = [
    {
      id: "kycAttestationOutput",
      schema: [
        {
          uri: "https://verity.id/schemas/identity/1.0.0/KYCAMLAttestation"
        }
      ],
      name: `Proof of KYC from ${issuer.name}`,
      description: `Attestation that ${issuer.name} has completed KYC/AML verification for this subject`,
      display: {
        title: {
          path: ["$.KYCAMLAttestation.authorityName"],
          fallback: `${issuer.name} KYC Attestation`
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
            label: "Authority",
            path: ["$.KYCAMLAttestation.authorityName"],
            schema: {
              type: "string"
            }
          },
          {
            label: "Authority URL",
            path: ["$.KYCAMLAttestation.authorityUrl"],
            schema: {
              type: "string",
              format: "uri"
            }
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

  return createManifest(
    KYCAML_ATTESTATION_MANIFEST_ID,
    issuer,
    outputDescriptors
  )
}

export function createCreditScoreManifest(
  issuer: CredentialIssuer,
  styles: EntityStyle = {}
): CredentialManifest {
  const outputDescriptors: OutputDescriptor[] = [
    {
      id: "creditScoreAttestationOutput",
      schema: [
        {
          uri: "https://verity.id/schemas/identity/1.0.0/CreditScoreAttestation"
        }
      ],
      name: `Proof of Credit Score from ${issuer.name}`,
      description: `Attestation that ${issuer.name} has perfomed a Credit Score check for this subject`,
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

  return createManifest(
    CREDIT_SCORE_ATTESTATION_MANIFEST_ID,
    issuer,
    outputDescriptors
  )
}

/**
 * Fetches the manifest id from a credential application
 */
export function getManifestIdFromCredentialApplication(
  application: GenericCredentialApplication
): string {
  return application.credential_application.manifest_id
}

/**
 * Decode an encoded Credential Application.
 *
 * A Credential Application contains an encoded Verifiable Presentation in it's
 * `presentation` field. This method decodes the Verifiable Presentation and
 * returns the decoded application.
 */
export async function decodeCredentialApplication(
  credentialApplication: EncodedCredentialApplication,
  options?: VerifyPresentationOptions
): Promise<DecodedCredentialApplication> {
  const decodedPresentation = await decodeVerifiablePresentation(
    credentialApplication.presentation,
    options
  )

  return {
    ...credentialApplication,
    presentation: decodedPresentation
  }
}
