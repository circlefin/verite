import { proofOfControlPresentationDefinition } from "../../lib"
import { CredentialManifest } from "../../types"
import { KYC_ATTESTATION_SCHEMA_URI } from "./attestations"
import { didFixture } from "./dids"

/**
 * Helper function to generate a Credential Manifest with a known issuer
 */
export const manifestFixture = (value = 0): CredentialManifest => {
  const issuer = didFixture(value)
  return {
    id: "KYCAMLManifest",
    spec_version:
      "https://identity.foundation/credential-manifest/spec/v1.0.0/",
    issuer: {
      id: issuer.subject, // default is "did:key:z6MkiTBz1ymuepAQ4HEHYSF1H8quG5GLVVQR3djdX3mDooWp"
      name: "Issuer Inc."
    },
    format: { jwt_vc: { alg: ["EdDSA"] }, jwt_vp: { alg: ["EdDSA"] } },
    output_descriptors: [
      {
        id: "kyc_vc",
        schema: KYC_ATTESTATION_SCHEMA_URI,
        name: "Proof of KYC from Issuer Inc.",
        description:
          "Attestation that Issuer Inc. has completed KYC/AML verification for this subject",
        display: {
          title: {
            text: "Issuer Inc. KYC Attestation"
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
              schema: { type: "string", format: "date-time" }
            }
          ]
        },
        styles: {}
      }
    ],
    presentation_definition: proofOfControlPresentationDefinition()
  }
}
