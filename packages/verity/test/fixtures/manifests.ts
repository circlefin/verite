import { CredentialManifest } from "../../types"
import { didFixture } from "./dids"

/**
 * Helper function to generate a Credential Manifest with a known issuer
 */
export const manifestFixture = (value = 0): CredentialManifest => {
  const issuer = didFixture(value)
  return {
    id: "KYCAMLAttestation",
    version: "0.1.0",
    issuer: {
      id: issuer.subject, // default is "did:key:z6MkiTBz1ymuepAQ4HEHYSF1H8quG5GLVVQR3djdX3mDooWp"
      name: "Issuer Inc."
    },
    format: { jwt_vc: { alg: ["EdDSA"] }, jwt_vp: { alg: ["EdDSA"] } },
    output_descriptors: [
      {
        id: "kycAttestationOutput",
        schema: [
          {
            uri: "https://verity.id/schemas/identity/1.0.0/KYCAMLAttestation"
          }
        ],
        name: "Proof of KYC from Issuer Inc.",
        description:
          "Attestation that Issuer Inc. has completed KYC/AML verification for this subject",
        display: {
          title: {
            path: ["$.KYCAMLAttestation.authorityName"],
            fallback: "Issuer Inc. KYC Attestation"
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
              schema: { type: "string" }
            },
            {
              label: "Authority URL",
              path: ["$.KYCAMLAttestation.authorityUrl"],
              schema: { type: "string", format: "uri" }
            },
            {
              label: "Approved At",
              path: ["$.KYCAMLAttestation.approvalDate"],
              schema: { type: "string", format: "date-time" }
            }
          ]
        },
        styles: {}
      }
    ],
    presentation_definition: {
      id: "ProofOfControlPresentationDefinition",
      format: { jwt_vp: { alg: ["EdDSA"] } },
      input_descriptors: [
        {
          id: "proofOfIdentifierControlVP",
          name: "Proof of Control Verifiable Presentation",
          purpose:
            "A Verifiable Presentation establishing proof of identifier control over the DID.",
          schema: [
            { uri: "https://verity.id/schemas/identity/1.0.0/ProofOfControl" }
          ]
        }
      ]
    }
  }
}
