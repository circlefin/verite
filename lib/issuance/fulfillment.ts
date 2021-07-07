import { CredentialFulfillmentResponse } from "types"

export const generateFulfillment = (): CredentialFulfillmentResponse => {
  return {
    credential_fulfillment: {
      id: "a30e3b91-fb77-4d22-95fa-871689c322e2",
      manifest_id: "Circle-KYCAMLAttestation",
      descriptor_map: [
        {
          id: "input_1",
          format: "jwt_vc",
          path: "$.presentation.credential[0]"
        }
      ]
    },
    presentation: {
      id: "a30e7b91-fb77-4d22-95fa-871689c322e7",
      credential: {
        "@context": [
          "https://www.w3.org/2018/credentials/v1",
          "https://centre.io/identity"
        ],
        type: ["VerifiableCredential", "KYCAMLAttestation"],
        issuer: {
          id: "did:web:circle.com",
          name: "Circle"
        },
        issuanceDate: "2021-05-05T17:23:31.000Z",
        credentialSubject: {
          id: "did:key:z6MktTGgFRVL5H4y5G9sKT2TszYsogRuFfZNvyj2en3RiXhP",
          KYCAMLAttestation: {
            authorityId: "did:web:circle.com",
            approvalDate: "2020-06-01T14:00:00",
            expirationDate: "2021-06-01T13:59:59",
            authorityName: "Circle",
            authorityUrl: "https://circle.com",
            authorityCallbackUrl: "https://identity.circle.com",
            serviceProviders: [
              {
                name: "Jumio",
                score: 80
              },
              {
                name: "OFAC-SDN",
                score: 0
              }
            ]
          }
        },
        proof: {
          type: "Ed25519Signature2018",
          created: "2021-05-05T17:23:31Z",
          jws: "eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..aCXQTU2MMSzNvVAoUDSRt1iK2fohyeHKgBuWwabmDGFI-X7UTncBqqpthSmZk3FAOIJ5_YIvjHluTp-Au8Z9Ag",
          proofPurpose: "assertionMethod",
          verificationMethod:
            "did:key:z6MkfXKC89FTQATwEQ1yzrPbWReLMsbWKPxfrvHG3Td1PD7s#z6MkfXKC89FTQATwEQ1yzrPbWReLMsbWKPxfrvHG3Td1PD7s"
        }
      }
    }
  }
}
