import { NextApiHandler } from "next"
import { CredentialManifest } from "types"

const handler: NextApiHandler<CredentialManifest> = async (req, res) => {
  res.json({
    id: "Circle-KYCAMLAttestation",
    version: "0.1.0",
    issuer: {
      id: "did:web:circle.com",
      comment: "JSON-LD definition at https://circle.com/.well_known/did.json",
      name: "Circle",
      styles: {}
    },
    format: {
      jwt_vc: {
        alg: ["EdDSA", "ES256K"]
      },
      jwt_vp: {
        alg: ["EdDSA", "ES256K"]
      }
    },
    output_descriptors: [
      {
        id: "kycAttestationOutput",
        schema: [
          {
            uri: "http://centre.io/schemas/identity/1.0.0/KYCAMLAttestation"
          }
        ],
        name: "Proof of KYC from Circle",
        description:
          "Attestation that Circle has completed KYC/AML verification for this subject",
        display: {
          title: {
            path: ["$.authorityName", "$.vc.authorityName"],
            fallback: "Circle KYC Attestation"
          },
          subtitle: {
            path: ["$.approvalDate", "$.vc.approvalDate"],
            fallback: "Includes date of approval"
          },
          description: {
            text: "The KYC authority processes Know Your Customer and Anti-Money Laundering analysis, potentially employing a number of internal and external vendor providers."
          }
        },
        styles: {
          thumbnail: {
            uri: "https://circle.com/img/logo.png",
            alt: "Circle Logo"
          },
          hero: {
            uri: "https://circle.com/img/kycCred.png",
            alt: "KYC Visual"
          },
          background: {
            color: "#ff0000"
          },
          text: {
            color: "#d4d400"
          }
        }
      }
    ],
    presentation_definition: {
      id: "32f54163-7166-48f1-93d8-ff217bdb0653",
      format: {
        jwt_vp: {
          alg: ["EdDSA", "ES256K"]
        }
      },
      input_descriptors: [
        {
          id: "DID",
          name: "DID",
          purpose:
            "The DID subject of the credential, and proof of current control over the DID.",
          schema: [
            {
              uri: "https://www.w3.org/2018/credentials/v1"
            }
          ]
        }
      ]
    }
  })
}

export default handler
