import { CredentialManifestBuilder } from "../../../lib"


describe("CredentialManifestBuilder", () => {
  it("works", async () => {
    
    const credentialApplication = new CredentialManifestBuilder("manifest123")
      .issuer({
        id: "did:key:z6MkiTBz1ymuepAQ4HEHYSF1H8quG5GLVVQR3djdX3mDooWp",
        name: "Issuer Inc."
      }).format({ jwt_vc: { alg: ["EdDSA"] }, jwt_vp: { alg: ["EdDSA"] } }).output_descriptors(
        [
          {
            "id": "eoc_output",
            "schema": "https://schema.org/EducationalOccupationalCredential",
          }
        ]
      ).build()

   expect(credentialApplication).toEqual({
    "id": "manifest123",
    "spec_version": "https://identity.foundation/credential-manifest/spec/v1.0.0/",
    "output_descriptors": [
      {
        "id": "eoc_output",
        "schema": "https://schema.org/EducationalOccupationalCredential"
      }
    ],
    "issuer": {
      "id": "did:key:z6MkiTBz1ymuepAQ4HEHYSF1H8quG5GLVVQR3djdX3mDooWp",
      "name": "Issuer Inc."
    },
    "format": {
      "jwt_vc": {
        "alg": [
          "EdDSA"
        ]
      },
      "jwt_vp": {
        "alg": [
          "EdDSA"
        ]
      }
    }
  })
  })
})
