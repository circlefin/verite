import { CredentialResponseBuilder } from "../../../lib"

describe("CredentialResepnseBuilder", () => {
  it("works", async () => {
    const credentialResponse = new CredentialResponseBuilder()
      .application_id("application_id_123")
      .manifest_id("manifest123")
      .fulfillment([
        {
          id: "eoc_output",
          format: "jwt_vp",
          path: "$.verifiableCredential"
        }
      ])
      .build()

    expect(credentialResponse).toMatchObject({
      spec_version:
        "https://identity.foundation/credential-manifest/spec/v1.0.0/",
      manifest_id: "manifest123",
      application_id: "application_id_123",
      fulfillment: {
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

  it("works with denial", async () => {
    // TODFIX: correct the autocomplete
    const credentialResponse = new CredentialResponseBuilder()
      .application_id("application_id_123")
      .manifest_id("manifest123")
      .denial("denial_reason", ["input_descriptor_1", "input_descriptor_2"])
      .build()

    expect(credentialResponse).toMatchObject({
      spec_version:
        "https://identity.foundation/credential-manifest/spec/v1.0.0/",
      manifest_id: "manifest123",
      application_id: "application_id_123",
      denial: {
        reason: "denial_reason",
        input_descriptors: ["input_descriptor_1", "input_descriptor_2"]
      }
    })
  })

  it("works with initFromManifest", async () => {
    const credentialResponse = new CredentialResponseBuilder()
      .initFromManifest({
        id: "manifest123",
        spec_version:
          "https://identity.foundation/credential-manifest/spec/v1.0.0/",
        issuer: {
          id: "did:example:123"
        },
        output_descriptors: [
          {
            id: "eoc_output",
            schema: "https://schemas123.org/Schema",
            name: "name",
            description: "description"
          }
        ]
      })
      .build()

    expect(credentialResponse).toMatchObject({
      spec_version:
        "https://identity.foundation/credential-manifest/spec/v1.0.0/",
      manifest_id: "manifest123",
      fulfillment: {
        descriptor_map: [
          {
            id: "eoc_output",
            format: "jwt_vc",
            path: "$.verifiableCredential[0]"
          }
        ]
      }
    })
  })

  it("uses id if provided", async () => {
    const credentialResponse = new CredentialResponseBuilder("myid123")
      .application_id("application_id_123")
      .manifest_id("manifest123")
      .fulfillment([
        {
          id: "eoc_output",
          format: "jwt_vp",
          path: "$.verifiableCredential"
        }
      ])
      .build()

    expect(credentialResponse.id).toEqual("myid123")
  })

  it("generates id if not provided", async () => {
    const credentialResponse = new CredentialResponseBuilder()
      .application_id("application_id_123")
      .manifest_id("manifest123")
      .fulfillment([
        {
          id: "eoc_output",
          format: "jwt_vp",
          path: "$.verifiableCredential"
        }
      ])
      .build()

    expect(credentialResponse.id).toBeDefined()
  })
})
