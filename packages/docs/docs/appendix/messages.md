---
sidebar_position: 2
---

# Message Formats & Samples

## Credential Offer

Verity's Credential Offer structure is a simple JWM wrapper around a DIF Credential Manifest.

```json
{
  "id": "4487e7d1-7d10-4075-a923-bae9332266c1",
  "type": "https://verity.id/types/CredentialOffer",
  "from": "did:key:z6Mkgw8mPijYRa3TkHSYtQ4P7S2HGrcJBwzdgjeurqr9Luqb",
  "created_time": 1631582525816,
  "expires_time": 1634174525816,
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

## Credential Manifest

Example DIF Credential Manifest for a KYCAMLAttestation issued by a fictional issuer, Example Inc. Notice the descriptive text found in the output descriptors, which can be used by wallets to render details about the credential being issued. The presentation definition describes the inputs necessary to receive a credential. In this case, it is a Verifiable Presentation with no credentials, which is sufficient to prove control over the presentation holder's did.

```json
{
  "id": "KYCAMLAttestation",
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
      "id": "kycAttestationOutput",
      "schema": [
        {
          "uri": "https://verity.id/schemas/identity/1.0.0/KYCAMLAttestation"
        }
      ],
      "name": "Proof of KYC from Verity",
      "description": "Attestation that Verity has completed KYC/AML verification for this subject",
      "display": {
        "title": {
          "path": ["$.KYCAMLAttestation.authorityName"],
          "fallback": "Verity KYC Attestation"
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
            "label": "Authority",
            "path": ["$.KYCAMLAttestation.authorityName"],
            "schema": {
              "type": "string"
            }
          },
          {
            "label": "Authority URL",
            "path": ["$.KYCAMLAttestation.authorityUrl"],
            "schema": {
              "type": "string",
              "format": "uri"
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
          "alt": "Verity Logo"
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
            "uri": "https://verity.id/schemas/identity/1.0.0/ProofOfControl"
          }
        ]
      }
    ]
  }
}
```

## Credential Application

```json
{
  "credential_application": {
    "id": "aaa23771-b8c1-4d06-bdc8-8bc2106e2456",
    "manifest_id": "KYCAMLAttestation",
    "format": {
      "jwt_vp": {
        "alg": ["EdDSA", "ES256K"]
      }
    }
  },
  "presentation_submission": {
    "id": "40d5d250-0181-48be-bca8-323ff053216f",
    "definition_id": "ProofOfControlPresentationDefinition",
    "descriptor_map": [
      {
        "id": "proofOfIdentifierControlVP",
        "format": "jwt_vp",
        "path": "$.presentation"
      }
    ]
  },
  "presentation": "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJ2...VOIn0.U1Uj7RClSfqJkUGQCR3E5dT3ttZwrC_9aJ-jK0vzIRoDW6BFurOSlcLab5RgczmozeFDXipWWXNSjLXTE4_2DQ"
}
```

## Credential Fulfillment

```json
{
  "credential_fulfillment": {
    "id": "8a667b5b-cbe1-4a4f-bc60-70a465c73b06",
    "manifest_id": "CreditScoreAttestation",
    "descriptor_map": [
      {
        "id": "proofOfIdentifierControlVP",
        "format": "jwt_vc",
        "path": "$.presentation.credential[0]"
      }
    ]
  },
  "presentation": "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJ...CJ9.ayciOKLBZjt4OcTeatjfutvGNd9Ya2ztoZyWVsKKlKIn-N-wq7JnT95aS8MdVFwBEttH6_AzvfwoUe1JeJyWAA"
}
```

Decoded credential:

```json
{
  "credentialSubject": {
    "KYCAMLAttestation": {
      "@type": "KYCAMLAttestation",
      "approvalDate": "2021-09-14T02:00:07.540Z",
      "authorityId": "did:web:verity.id",
      "authorityName": "Verity",
      "authorityUrl": "https://verity.id",
      "authorityCallbackUrl": "https://identity.verity.id"
    },
    "id": "did:key:z6Mkjo9pGYpv88SCYZW3ZT1dxrKYJrPf6u6hBeGexChJF4EN"
  },
  "issuer": {
    "id": "did:key:z6Mkgw8mPijYRa3TkHSYtQ4P7S2HGrcJBwzdgjeurqr9Luqb"
  },
  "type": ["VerifiableCredential", "KYCAMLAttestation"],
  "credentialStatus": {
    "id": "http://example.com/api/revocation/05c74310-4810-4ec4-8402-cee4c28dda91#94372",
    "type": "RevocationList2021Status",
    "statusListIndex": "94372",
    "statusListCredential": "http://example.com/api/revocation/05c74310-4810-4ec4-8402-cee4c28dda91"
  },
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://verity.id/identity"
  ],
  "issuanceDate": "2021-09-14T02:00:07.000Z",
  "proof": {
    "type": "JwtProof2020",
    "jwt": "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJ...IifQ.xu8eUyPtDhAiHUhIszVtLvrlUJ6H9nGTEcZ1paXvqNolDXd0X3ORugCWjAWMTASaIJcPrmkpLoZzw9OXMYofCg"
  }
}
```

## Presentation Request

```json
{
    "id": "1308e77f-9ab0-4de7-97a8-ad2111b585bf",
    "type": "https://verity.id/types/VerificationRequest",
    "from": "did:key:z6MkizuwMHiYpZrBAn64ZnbS2cz5og7iGqAa3nV3EuTj4aaZ",
    "created_time": 1631650772655,
    "expires_time": 1634242772655,
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

## Presentation Submission

```json
{
  "presentation_submission": {
    "id": "d885c76f-a908-401a-9e41-abbbeddfe886",
    "definition_id": "KYCAMLPresentationDefinition",
    "descriptor_map": [
      {
        "id": "kycaml_input",
        "format": "jwt_vc",
        "path": "$.presentation.verifiableCredential[0]"
      }
    ]
  },
  "presentation": "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJ2...OIn0.qYRiRYtZxkVHlns2pJGKC-rh8gsfgxiKXjxnhA6iyMZIIXrL9urfiv07f1RXgHyWpiBXvhO91B10cBqhi8y8Ag"
}
```

Response

```json
{
  "status": "approved"
}
```
