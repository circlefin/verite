---
sidebar_position: 2
---

# Message Formats & Samples

## Credentials

### Verifiable Credential

The following represents the intermediate form of a JWT-encoded verifiable credential _post-verification_ and post-decoding to restore the "credential" (i.e., combining fields from both the payload and the protected headers of the JWT token):

```json
{
  "credentialSubject": {
    "KYCAMLAttestation": {
      "type": "KYCAMLAttestation",
      "process": "https://verite.id/definitions/processes/kycaml/0.0.1/usa",
      "approvalDate": "2021-09-14T02:00:07.540Z"
    },
    "id": "did:key:z6Mkjo9pGYpv88SCYZW3ZT1dxrKYJrPf6u6hBeGexChJF4EN"
  },
  "issuer": {
    "id": "did:web:verite.id"
  },
  "type": ["VerifiableCredential", "KYCAMLCredential"],
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    { "@vocab": "https://verite.id/identity/" }
  ],
  "issuanceDate": "2021-09-14T02:00:07.000Z"
}
```

### Verifiable Credential with status

The following represents the intermediate form of a JWT-encoded verifiable credential _post-verification_ and post-decoding to restore the "credential" (i.e., combining fields from both the payload and the protected headers of the JWT token). Note that the credential status has not been dereferenced (i.e., "fetched" as a bitstring and validated), which some systems might want to do before processing and/or storing the credential.

```json
{
  "credentialSubject": {
    "KYCAMLAttestation": {
      "type": "KYCAMLAttestation",
      "process": "https://verite.id/definitions/processes/kycaml/0.0.1/usa",
      "approvalDate": "2021-09-14T02:00:07.540Z"
    },
    "id": "did:key:z6Mkjo9pGYpv88SCYZW3ZT1dxrKYJrPf6u6hBeGexChJF4EN"
  },
  "issuer": {
    "id": "did:web:verite.id"
  },
  "type": ["VerifiableCredential", "KYCAMLCredential"],
  "credentialStatus": {
    "id": "http://example.com/api/revocation/05c74310-4810-4ec4-8402-cee4c28dda91#94372",
    "type": "RevocationList2021Status",
    "statusListIndex": "94372",
    "statusListCredential": "http://example.com/api/revocation/05c74310-4810-4ec4-8402-cee4c28dda91"
  },
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    { "@vocab": "https://verite.id/identity/" }
  ],
  "issuanceDate": "2021-09-14T02:00:07.000Z"
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
    "id": "did:web:example.com",
    "name": "Example Inc.",
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
      "id": "kyc_vc",
      "schema": "https://verite.id/definitions/schemas/0.0.1/KYCAMLAttestation",
      "name": "Proof of KYC from Verite",
      "description": "Attestation that Verite has completed KYC/AML verification for this subject",
      "display": {
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
          "uri": "http://example.com/img/kyc-aml-thumbnail.png",
          "alt": "Verite Logo"
        },
        "hero": {
          "uri": "http://example.com/img/kyc-aml-hero.png",
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
        "purpose": "A Verifiable Presentation establishing proof of identifier control over the DID.",
        "schema": [
          {
            "uri": "https://verite.id/definitions/schemas/0.0.1/ProofOfControl"
          }
        ]
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
