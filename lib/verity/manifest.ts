import { v4 as uuidv4 } from "uuid"
import {
  CredentialIssuer,
  CredentialManifest,
  EntityStyle,
  OutputDescriptor,
  PresentationDefinition
} from "./types"

export function generateKycAmlManifest(
  issuer: CredentialIssuer,
  styles: EntityStyle | string = {}
): CredentialManifest {
  const outputDescriptors: OutputDescriptor[] = [
    {
      id: "kycAttestationOutput",
      schema: [
        {
          uri: "http://centre.io/schemas/identity/1.0.0/KYCAMLAttestation"
        }
      ],
      name: `Proof of KYC from ${issuer.name}`,
      description: `Attestation that ${issuer.name} has completed KYC/AML verification for this subject`,
      display: {
        title: {
          path: ["$.authorityName", "$.vc.authorityName"],
          fallback: `${issuer.name} KYC Attestation`
        },
        subtitle: {
          path: ["$.approvalDate", "$.vc.approvalDate"],
          fallback: "Includes date of approval"
        },
        description: {
          text: "The KYC authority processes Know Your Customer and Anti-Money Laundering analysis, potentially employing a number of internal and external vendor providers."
        }
      },
      styles
    }
  ]

  const presentationDefinition: PresentationDefinition = {
    id: uuidv4(),
    format: {
      jwt_vp: {
        alg: ["EdDSA", "ES256K"]
      }
    },
    input_descriptors: [
      {
        id: "kyc_input_1",
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

  return {
    id: "KYCAMLAttestation",
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
