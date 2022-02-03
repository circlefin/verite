import { randomBytes } from "crypto"
import { omit } from "lodash"

import { hasPaths } from "../../../lib"
import {
  buildCreditScoreManifest,
  buildKycAmlManifest,
  requiresRevocableCredentials
} from "../../../lib/issuer/credential-manifest"
import { randomDidKey } from "../../../lib/utils"
import { CredentialManifest } from "../../../types"
import { didFixture } from "../../fixtures/dids"

// Helper function to ensure the Credential Manifest has the bare-minimum
// requirements.
function validateManifestFormat(
  manifest: CredentialManifest | Record<string, unknown>
): boolean {
  return hasPaths(manifest, [
    "id",
    "version",
    "issuer.id",
    "output_descriptors[0]",
    "output_descriptors[0].id",
    "output_descriptors[0].schema"
  ])
}

describe("buildKycAmlManifest", () => {
  it("returns a valid manifest", () => {
    const issuerDid = didFixture(0)
    const issuer = { id: issuerDid.subject }
    const manifest = buildKycAmlManifest(issuer)
    expect(validateManifestFormat(manifest)).toBe(true)
  })

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
              uri: "https://demos.verite.id/schemas/identity/1.0.0/KYCAMLAttestation"
            }
          ],
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
              {
                uri: "https://demos.verite.id/schemas/identity/1.0.0/ProofOfControl"
              }
            ]
          }
        ]
      }
    }

    expect(manifest).toEqual(expected)
  })
})

describe("buildCreditScoreManifest", () => {
  it("returns a valid manifest", () => {
    const issuerDid = didFixture(0)
    const issuer = { id: issuerDid.subject }
    const manifest = buildCreditScoreManifest(issuer)
    expect(validateManifestFormat(manifest)).toBe(true)
  })

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
              uri: "https://demos.verite.id/schemas/identity/1.0.0/CreditScoreAttestation"
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
              {
                uri: "https://demos.verite.id/schemas/identity/1.0.0/ProofOfControl"
              }
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
    const issuerDid = randomDidKey(randomBytes)
    const issuer = { id: issuerDid.subject }
    const manifest = buildKycAmlManifest(issuer)
    expect(requiresRevocableCredentials(manifest)).toBeTruthy()
  })

  it("is false for CreditScoreAttestations", () => {
    const issuerDid = randomDidKey(randomBytes)
    const issuer = { id: issuerDid.subject }
    const manifest = buildCreditScoreManifest(issuer)
    expect(requiresRevocableCredentials(manifest)).toBeFalsy()
  })
})

describe("validateManifestFormat", () => {
  it("returns true if all required fields are present", () => {
    const issuerDidKey = randomDidKey(randomBytes)
    const credentialIssuer = { id: issuerDidKey.subject, name: "Verite" }
    const manifest = omit(buildKycAmlManifest(credentialIssuer), [
      "format",
      "presentation_definition"
    ])

    expect(validateManifestFormat(manifest)).toBe(true)
  })

  it("ignores optional fields", () => {
    const issuerDid = randomDidKey(randomBytes)
    const credentialIssuer = { id: issuerDid.subject, name: "Verite" }
    const manifest = buildKycAmlManifest(credentialIssuer)

    expect(hasPaths(manifest, ["presentation_definition", "format"])).toBe(true)
    expect(validateManifestFormat(manifest)).toBe(true)
  })

  it("returns false if any of the fields are missing", async () => {
    const issuerDid = await randomDidKey(randomBytes)
    const credentialIssuer = { id: issuerDid.subject, name: "Verite" }
    const manifest = buildKycAmlManifest(credentialIssuer)
    const requiredKeys = ["id", "version", "issuer", "output_descriptors"]

    requiredKeys.forEach((key) => {
      const omitted = omit(manifest, [key])
      expect(validateManifestFormat(omitted)).toBe(false)
    })
  })
})
