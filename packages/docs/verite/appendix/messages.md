---
sidebar_position: 2
---

# Message Formats & Samples

## Credentials

### Verifiable Credential

The following represents the intermediate did-jwt-vc decoded form of a JWT-encoded verifiable credential:

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    {
      "@vocab": "https://verite.id/identity/"
    }
  ],
  "type": ["VerifiableCredential", "KYCAMLCredential"],
  "issuer": {
    "id": "did:key:z6Mkr3ENcbaQTaQ97V7FahjYwC6iYM821846m57oHaFSnxQx"
  },
  "credentialSubject": {
    "id": "did:key:z6MkpVasvTGxhLwMycLWWBa7WaYZTpvc3PstVdKaie5phPut",
    "KYCAMLAttestation": {
      "type": "KYCAMLAttestation",
      "process": "https://verite.id/definitions/processes/kycaml/0.0.1/usa",
      "approvalDate": "2022-08-29T23:30:49.291Z"
    }
  },
  "expirationDate": "2022-10-28T23:30:49.291Z",
  "issuanceDate": "2022-08-29T23:30:49.000Z",
  "proof": {
    "type": "JwtProof2020",
    "jwt": "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...<SNIP>...crQDg"
  }
}
```

### Verifiable Credential with status

This extends the above to add credential status. Note that the credential status has not been dereferenced (i.e., "fetched" as a bitstring and validated), which some systems might want to do before processing and/or storing the credential.

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    {
      "@vocab": "https://verite.id/identity/"
    }
  ],
  "type": ["VerifiableCredential", "KYCAMLCredential"],
  "issuer": {
    "id": "did:key:z6Mkr3ENcbaQTaQ97V7FahjYwC6iYM821846m57oHaFSnxQx"
  },
  "credentialSubject": {
    "id": "did:key:z6MkpVasvTGxhLwMycLWWBa7WaYZTpvc3PstVdKaie5phPut",
    "KYCAMLAttestation": {
      "type": "KYCAMLAttestation",
      "process": "https://verite.id/definitions/processes/kycaml/0.0.1/usa",
      "approvalDate": "2022-08-29T23:30:49.291Z"
    }
  },
  "credentialStatus": {
    "id": "http://192.168.2.3:3000/api/demos/revocation/e434beeb-d745-447c-b3d7-5e82a95ccb27#50305",
    "type": "RevocationList2021Status",
    "statusListIndex": "50305",
    "statusListCredential": "http://192.168.2.3:3000/api/demos/revocation/e434beeb-d745-447c-b3d7-5e82a95ccb27"
  },
  "expirationDate": "2022-10-28T23:30:49.291Z",
  "issuanceDate": "2022-08-29T23:30:49.000Z",
  "proof": {
    "type": "JwtProof2020",
    "jwt": "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSIseyJAdm9jYWIiOiJodHRwczovL3Zlcml0ZS5pZC9pZGVudGl0eS8ifV0sInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiLCJLWUNBTUxDcmVkZW50aWFsIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7ImlkIjoiZGlkOmtleTp6Nk1rcFZhc3ZUR3hoTHdNeWNMV1dCYTdXYVlaVHB2YzNQc3RWZEthaWU1cGhQdXQiLCJLWUNBTUxBdHRlc3RhdGlvbiI6eyJ0eXBlIjoiS1lDQU1MQXR0ZXN0YXRpb24iLCJwcm9jZXNzIjoiaHR0cHM6Ly92ZXJpdGUuaWQvZGVmaW5pdGlvbnMvcHJvY2Vzc2VzL2t5Y2FtbC8wLjAuMS91c2EiLCJhcHByb3ZhbERhdGUiOiIyMDIyLTA4LTI5VDIzOjMwOjQ5LjI5MVoifX0sImlzc3VhbmNlRGF0ZSI6IjIwMjItMDgtMjlUMjM6MzA6NDkuMjkyWiIsImlzc3VlciI6eyJpZCI6ImRpZDprZXk6ejZNa3IzRU5jYmFRVGFROTdWN0ZhaGpZd0M2aVlNODIxODQ2bTU3b0hhRlNueFF4In0sImNyZWRlbnRpYWxTY2hlbWEiOnsiY3JlZGVudGlhbFN0YXR1cyI6eyJpZCI6Imh0dHA6Ly8xOTIuMTY4LjIuMzozMDAwL2FwaS9kZW1vcy9yZXZvY2F0aW9uL2U0MzRiZWViLWQ3NDUtNDQ3Yy1iM2Q3LTVlODJhOTVjY2IyNyM1MDMwNSIsInR5cGUiOiJSZXZvY2F0aW9uTGlzdDIwMjFTdGF0dXMiLCJzdGF0dXNMaXN0SW5kZXgiOiI1MDMwNSIsInN0YXR1c0xpc3RDcmVkZW50aWFsIjoiaHR0cDovLzE5Mi4xNjguMi4zOjMwMDAvYXBpL2RlbW9zL3Jldm9jYXRpb24vZTQzNGJlZWItZDc0NS00NDdjLWIzZDctNWU4MmE5NWNjYjI3In0sImV4cGlyYXRpb25EYXRlIjoiMjAyMi0xMC0yOFQyMzozMDo0OS4yOTFaIn19LCJuYmYiOjE2NjE4MTU4NDksImlzcyI6ImRpZDprZXk6ejZNa3IzRU5jYmFRVGFROTdWN0ZhaGpZd0M2aVlNODIxODQ2bTU3b0hhRlNueFF4Iiwic3ViIjoiZGlkOmtleTp6Nk1rcFZhc3ZUR3hoTHdNeWNMV1dCYTdXYVlaVHB2YzNQc3RWZEthaWU1cGhQdXQifQ.2QqOPxJU6bQE771O-q9lJTu-pEgs3BJnfwjPbqx88qk-_YK8bk_V9RLajEwiOtdWdK_ktTrLaB1IzDe8NcrQDg"
  }
}
```

## Issuance

### Credential Offer

Verite's Credential Offer structure is a simple JWM wrapper around a DIF Credential Manifest.

```json
{
  "id": "4487e7d1-7d10-4075-a923-bae9332266c1",
  "type": "CredentialOffer",
  "from": "did:key:z6Mkgw8mPijYRa3TkHSYtQ4P7S2HGrcJBwzdgjeurqr9Luqb",
  "created_time": "2021-09-14T01:22:05.816Z",
  "expires_time": "2021-10-14T01:22:05.816Z",
  "reply_url": "http://example.com/api/issuance/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2MzE1ODI0MjUsImV4cCI6MTYzMTU4NjAyNSwic3ViIjoiMTUxOGNkNjEtNGFlNC00YmYwLTgzZDAtMjllMTE1NTA2MTFhIn0.94twxi4g3eR4sKxo7euKHtUcfIVLCkukukiGCi5CS70",
  "body": {
    "challenge": "d273da29-74dd-46de-a53c-1677c51cc700",
    "manifest": {}
  }
}
```

Details:

- `from`: who the message is from; in this case, the issuer
- `reply_url`: the URL the wallet should send the credential application to
- `body.challenge`: a challenge the wallet should sign when proving control, to prevent replays
- `body.manifest`: this follows the DIF Credential Manifest spec

### Credential Manifest

Example DIF Credential Manifest for a KYCAMLAttestation issued by a fictional issuer, Example Inc. Notice the descriptive text found in the output descriptors, which can be used by wallets to render details about the credential being issued. The presentation definition describes the inputs necessary to receive a credential. In this case, it is a Verifiable Presentation with no credentials, which is sufficient to prove control over the presentation holder's did.

```json
{
  "id": "KYCAMLManifest",
  "version": "0.1.0",
  "issuer": {
    "id": "did:web:demos.verite.id",
    "name": "Verite",
    "styles": {}
  },
  "format": {
    "jwt_vc": {
      "alg": ["EdDSA"]
    },
    "jwt_vp": {
      "alg": ["EdDSA"]
    }
  },
  "output_descriptors": [
    {
      "id": "KYCAMLCredential",
      "schema": "https://verite.id/definitions/schemas/0.0.1/KYCAMLAttestation",
      "name": "Proof of KYC from Verite",
      "description": "Attestation that Verite has completed KYC/AML verification for this subject",
      "display": {
        "title": {
          "text": "Verite KYC Attestation"
        },
        "subtitle": {
          "path": ["$.approvalDate", "$.vc.approvalDate"],
          "fallback": "Includes date of approval"
        },
        "description": {
          "text": "The KYC authority processes Know Your Customer and Anti-Money Laundering analysis, potentially employing a number of internal and external vendor providers."
        },
        "properties": [
          {
            "label": "Process",
            "path": ["$.KYCAMLAttestation.process"],
            "schema": {
              "type": "string"
            }
          },
          {
            "label": "Approved At",
            "path": ["$.KYCAMLAttestation.approvalDate"],
            "schema": {
              "type": "string",
              "format": "date-time"
            }
          }
        ]
      },
      "styles": {
        "thumbnail": {
          "uri": "http://192.168.2.3:3000/img/kyc-aml-thumbnail.png",
          "alt": "Verite Logo"
        },
        "hero": {
          "uri": "http://192.168.2.3:3000/img/kyc-aml-hero.png",
          "alt": "KYC+AML Visual"
        },
        "background": {
          "color": "#EC4899"
        },
        "text": {
          "color": "#FFFFFF"
        }
      }
    }
  ],
  "presentation_definition": {
    "id": "ProofOfControlPresentationDefinition",
    "format": {
      "jwt_vp": {
        "alg": ["EdDSA"]
      }
    },
    "input_descriptors": [
      {
        "id": "proofOfIdentifierControlVP",
        "name": "Proof of Control Verifiable Presentation",
        "purpose": "A VP establishing proof of identifier control over the DID.",
        "constraints": {
          "fields": [
            {
              "id": "holder",
              "path": ["$.holder"],
              "purpose": "The VP should contain a DID in the holder, which is the same DID that signs the VP. This DID will be used as the subject of the issued VC"
            }
          ]
        }
      }
    ]
  }
}
```

### Credential Application

What follows is a JSON object containing the same contents as a Verifiable Presentation in JWT form; there is no proof object, because it would be signed and transmitted as a JWT.

```json
{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "credential_application": {
    "id": "2ce196be-fcda-4054-9eeb-8e4c5ef771e5",
    "manifest_id": "KYCAMLManifest",
    "format": {
      "jwt_vp": {
        "alg": ["EdDSA"]
      }
    }
  },
  "presentation_submission": {
    "id": "b4f43310-1d6b-425d-84c6-f8afac3fe244",
    "definition_id": "ProofOfControlPresentationDefinition",
    "descriptor_map": [
      {
        "id": "proofOfIdentifierControlVP",
        "format": "jwt_vp",
        "path": "$.presentation"
      }
    ]
  },
  "verifiableCredential": [], // Credential would be found here, as a JWT, i.e. ["eyJhbG..."]
  "holder": "did:key:z6MkjFFeDnzyKL7Q39aNs1piGo27b12upMf1MmSDQcABJmmn",
  "type": ["VerifiablePresentation", "CredentialApplication"]
}
```

### Credential Fulfillment

What follows is a JSON object containing the same contents as a Verifiable Presentation in JWT form; there is no proof object, because it would be signed and transmitted as a JWT.

```json
{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "type": ["VerifiablePresentation", "CredentialFulfillment"],
  "holder": "did:key:z6Mkgw8mPijYRa3TkHSYtQ4P7S2HGrcJBwzdgjeurqr9Luqb",
  "credential_fulfillment": {
    "id": "5f22f1ea-0441-4041-916b-2504a2a4075c",
    "manifest_id": "KYCAMLManifest",
    "descriptor_map": [
      {
        "id": "proofOfIdentifierControlVP",
        "format": "jwt_vc",
        "path": "$.verifiableCredential[0]"
      }
    ]
  },
  "verifiableCredential": [] // Credential would be found here, as a JWT, i.e. ["eyJhbG..."]
}
```

## Presentation Exchange

### Presentation Request

```json
{
    "id": "1308e77f-9ab0-4de7-97a8-ad2111b585bf",
    "type": "VerificationRequest",
    "from": "did:key:z6MkizuwMHiYpZrBAn64ZnbS2cz5og7iGqAa3nV3EuTj4aaZ",
    "created_time": "2021-09-14T20:19:32.655Z",
    "expires_time": "2021-10-14T20:19:32.655Z",
    "reply_url": "http://example.com/api/verification/1308e77f-9ab0-4de7-97a8-ad2111b585bf/submission",
    "body": {
        "status_url": "http://example.com/api/verification/1308e77f-9ab0-4de7-97a8-ad2111b585bf/callback",
        "challenge": "e0e52794-7889-451c-bb05-28d8cff9ed13",
        "presentation_definition": {
            "id": "KYCAMLPresentationDefinition",
            ...
        }
    }
}
```

Details:

- `from`: who the message is from; in this case, the issuer
- `reply_url`: the URL the wallet should send the credential submission to
- `body.challenge`: a challenge the wallet should sign when proving control, to prevent replays
- `body.presentation_definition`: this follows the DIF Presentation Definition spec
- `body.status_url`: url returning verification results when complete

### Presentation Submission

```json
{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "presentation_submission": {
    "id": "d885c76f-a908-401a-9e41-abbbeddfe886",
    "definition_id": "KYCAMLPresentationDefinition",
    "descriptor_map": [
      {
        "id": "kycaml_vc",
        "format": "jwt_vc",
        "path": "$.presentation.verifiableCredential[0]"
      }
    ]
  },
  "verifiableCredential": [
    {
      "type": ["VerifiableCredential", "KYCAMLCredential"],
      "credentialSubject": {
        "id": "did:key:z6Mkjo9pGYpv88SCYZW3ZT1dxrKYJrPf6u6hBeGexChJF4EN",
        "KYCAMLAttestation": {
          "type": "KYCAMLAttestation",
          "process": "https://verite.id/definitions/processes/kycaml/0.0.1/usa",
          "approvalDate": "2021-09-14T02:00:07.540Z"
        }
      },
      "issuer": {
        "id": "did:web:verite.id"
      }
    }
  ]
}
```

Response

```json
{
  "status": "approved"
}
```
