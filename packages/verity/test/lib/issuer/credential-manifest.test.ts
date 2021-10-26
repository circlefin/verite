import {
  buildCreditScoreManifest,
  buildKycAmlManifest,
  requiresRevocableCredentials
} from "../../../lib/issuer/credential-manifest"
import { generateDidKey, randomDidKey } from "../../../lib/utils"
import { didFixture } from "../../fixtures/dids"

describe("buildKycAmlManifest", () => {
  it("returns a manifest", () => {
    const issuerDid = didFixture(0)

    // The issuer in a Credential Manifest lets you define additional
    // properties to assist identity wallets render the interaction.
    const issuer = { id: issuerDid.subject, name: "Issuer Inc." }
    const manifest = buildKycAmlManifest(issuer)

    const expected = {
      id: "KYCAMLAttestation",
      version: "0.1.0",
      issuer: {
        id: "did:key:z6MkiTBz1ymuepAQ4HEHYSF1H8quG5GLVVQR3djdX3mDooWp",
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

    expect(manifest).toEqual(expected)
  })
})

describe("buildCreditScoreManifest", () => {
  it("returns a manifest", () => {
    const issuerDid = didFixture(0)

    // The issuer in a Credential Manifest lets you define additional
    // properties to assist identity wallets render the interaction.
    const issuer = { id: issuerDid.subject, name: "Issuer Inc." }
    const manifest = buildCreditScoreManifest(issuer)

    const expected = {
      id: "CreditScoreAttestation",
      version: "0.1.0",
      issuer: {
        id: "did:key:z6MkiTBz1ymuepAQ4HEHYSF1H8quG5GLVVQR3djdX3mDooWp",
        name: "Issuer Inc."
      },
      format: { jwt_vc: { alg: ["EdDSA"] }, jwt_vp: { alg: ["EdDSA"] } },
      output_descriptors: [
        {
          id: "creditScoreAttestationOutput",
          schema: [
            {
              uri: "https://verity.id/schemas/identity/1.0.0/CreditScoreAttestation"
            }
          ],
          name: "Proof of Credit Score from Issuer Inc.",
          description:
            "Attestation that Issuer Inc. has performed a Credit Score check for this subject",
          display: {
            title: { text: "Issuer Inc. Risk Score" },
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
                schema: { type: "number" }
              },
              {
                label: "Score Type",
                path: ["$.CreditScoreAttestation.scoreType"],
                schema: { type: "string" }
              },
              {
                label: "Provider",
                path: ["$.CreditScoreAttestation.provider"],
                schema: { type: "string" }
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

    expect(manifest).toEqual(expected)
  })
})

describe("requiresRevocableCredentials", () => {
  it("is true for KYCAMLAttestations", () => {
    const issuerDid = randomDidKey()
    const issuer = { id: issuerDid.subject }
    const manifest = buildKycAmlManifest(issuer)
    expect(requiresRevocableCredentials(manifest)).toBeTruthy()
  })

  it("is false for CreditScoreAttestations", () => {
    const issuerDid = randomDidKey()
    const issuer = { id: issuerDid.subject }
    const manifest = buildCreditScoreManifest(issuer)
    expect(requiresRevocableCredentials(manifest)).toBeFalsy()
  })
})
