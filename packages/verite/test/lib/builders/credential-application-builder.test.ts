import { CredentialApplicationBuilder } from "../../../lib"
import { ClaimFormat } from "../../../types"

describe("CredentialApplicationBuilder", () => {
  it("works", async () => {
    const credentialApplication = new CredentialApplicationBuilder()
      .id("credential_application_123")
      .manifest_id("manifest123")
      .format({ jwt_vp: { alg: ["EdDSA"] } })
      .presentation_submission({
        id: "presentation_submission_123",
        definition_id: "presentation_definition_123",
        descriptor_map: [
          {
            id: "eoc_output",
            format: ClaimFormat.JwtVp, // "jwt_vp", // TOFIX:why doesn't constant work?
            path: "$.verifiableCredential"
          }
        ]
      })
      .build()

    expect(credentialApplication).toEqual({
      id: "credential_application_123",
      spec_version:
        "https://identity.foundation/credential-manifest/spec/v1.0.0/",
      manifest_id: "manifest123",
      format: {
        jwt_vp: {
          alg: ["EdDSA"]
        }
      },
      presentation_submission: {
        id: "presentation_submission_123",
        definition_id: "presentation_definition_123",
        descriptor_map: [
          {
            id: "eoc_output",
            format: "jwt_vp",
            path: "$.verifiableCredential"
          }
        ]
      }
    })
  })
})
