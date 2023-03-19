import { randomBytes } from "crypto"
import { omit } from "lodash"

import { hasPaths } from "../../../lib"
import {
  buildCreditScoreManifest,
  buildSampleProcessApprovalManifest
} from "../../../lib/sample-data/manifests"
import { randomDidKey } from "../../../lib/utils"
import { AttestationTypes, CredentialManifest } from "../../../types"
import { didFixture } from "../../fixtures/dids"

// Helper function to ensure the Credential Manifest has the bare-minimum
// requirements.
function validateManifestFormat(
  manifest: CredentialManifest | Record<string, unknown>
): boolean {
  return hasPaths(manifest, [
    "id",
    "spec_version",
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
    const manifest = buildSampleProcessApprovalManifest(
      AttestationTypes.KYCAMLAttestation,
      issuer
    )
    expect(validateManifestFormat(manifest)).toBe(true)
  })

  it("returns a manifest", () => {
    const issuerDid = didFixture(0)

    // The issuer in a Credential Manifest lets you define additional
    // properties to assist identity wallets render the interaction.
    const issuer = { id: issuerDid.subject, name: "Issuer Inc." }
    const manifest = buildSampleProcessApprovalManifest(
      AttestationTypes.KYCAMLAttestation,
      issuer
    )

    const expected = {
      id: "KYCAMLManifest",
      spec_version:
        "https://identity.foundation/credential-manifest/spec/v1.0.0/",
      issuer: {
        id: "did:key:z6MkiTBz1ymuepAQ4HEHYSF1H8quG5GLVVQR3djdX3mDooWp",
        name: "Issuer Inc."
      },
      format: { jwt_vc: { alg: ["EdDSA"] } },
      output_descriptors: [
        {
          id: "KYCAMLCredential",
          schema:
            "https://verite.id/definitions/schemas/0.0.1/KYCAMLAttestation",
          name: "KYCAMLCredential from Issuer Inc.",
          description:
            "Attestation that Issuer Inc. has completed KYCAMLAttestation verification for this subject",
          display: {
            title: {
              text: "Issuer Inc. KYCAMLAttestation"
            },
            subtitle: {
              path: ["$.approvalDate", "$.vc.approvalDate"],
              fallback: "Includes date of approval"
            },
            description: {
              text: "The issuing authority processes KYCAMLAttestation analysis, potentially employing a number of internal and external vendor providers."
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
      ]
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
      id: "CreditScoreManifest",
      spec_version:
        "https://identity.foundation/credential-manifest/spec/v1.0.0/",
      issuer: {
        id: "did:key:z6MkiTBz1ymuepAQ4HEHYSF1H8quG5GLVVQR3djdX3mDooWp",
        name: "Issuer Inc."
      },
      format: { jwt_vc: { alg: ["EdDSA"] } },
      output_descriptors: [
        {
          id: "CreditScoreCredential",
          schema:
            "https://verite.id/definitions/schemas/0.0.1/CreditScoreAttestation",
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
      ]
    }

    expect(manifest).toEqual(expected)
  })
})

describe("validateManifestFormat", () => {
  it("returns true if all required fields are present", () => {
    const issuerDidKey = randomDidKey(randomBytes)
    const credentialIssuer = { id: issuerDidKey.subject, name: "Verite" }
    const manifest = omit(
      buildSampleProcessApprovalManifest(
        AttestationTypes.KYCAMLAttestation,
        credentialIssuer
      ),
      ["format", "presentation_definition"]
    )

    expect(validateManifestFormat(manifest)).toBe(true)
  })

  it("ignores optional fields", () => {
    const issuerDid = randomDidKey(randomBytes)
    const credentialIssuer = { id: issuerDid.subject, name: "Verite" }
    const manifest = buildSampleProcessApprovalManifest(
      AttestationTypes.KYCAMLAttestation,
      credentialIssuer
    )

    expect(hasPaths(manifest, ["presentation_definition"])).toBe(false)
    expect(validateManifestFormat(manifest)).toBe(true)
  })

  it("returns false if any of the fields are missing", async () => {
    const issuerDid = randomDidKey(randomBytes)
    const credentialIssuer = { id: issuerDid.subject, name: "Verite" }
    const manifest = buildSampleProcessApprovalManifest(
      AttestationTypes.KYCAMLAttestation,
      credentialIssuer
    )
    const requiredKeys = ["id", "spec_version", "issuer", "output_descriptors"]

    requiredKeys.forEach((key) => {
      const omitted = omit(manifest, [key])
      expect(validateManifestFormat(omitted)).toBe(false)
    })
  })
})
