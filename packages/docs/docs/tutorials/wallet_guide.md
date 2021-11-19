---
sidebar_label: "Wallet Implementation Guide"
sidebar_position: 9
---

# Verity Wallet Integration Guide

**Contact**: [identity@centre.io](mailto:identity@centre.io)

This guide is written for developers seeking to integrate Verity into custodial or non-custodial wallets.

## Minimal Wallet Requirements - Summary

- Generate or supply decentralized identifiers for credential subject
  - Recommend did:key for initial versions
- Generate VC/VP-JWT signatures
- Support Credential Flows described in this document

## Architectural Foundations

Verity uses a decentralized identity architecture, in which the individual (subject/holder) directly requests and receives credentials from an issuer, storing them in a digital wallet. In this model, individuals decide when and with whom they want to share their credentials, referred to as verifiers, or more generally, relying parties.

![Identity relationship between issuer, subject, verifier, and registry](/img/design-overview/identity-relationships.png)

The relying party verifies the credential, without necessarily needing to contact the issuer, through an extensible mechanism enabled by the VC spec. The verification process is designed to be privacy-respecting and cryptographically secure.

### Concepts Overview

Verity’s basis is the [W3C Verifiable Credentials (VCs) Data Model](https://www.w3.org/TR/vc-data-model). A credential is a claim made by an issuer about an individual (subject), and a verifiable credential is a cryptographically secure wrapper around the credential.

Following is a list of concepts used in Verity.

- **W3C Verifiable Credentials**: flexible, tamper-evident way for an issuer to make a claim about a subject in a way that is independently verifiable and privacy-preserving. VCs are the data model used for Verity claims
- **Verifiable Presentations**: also defined in the VC spec, are a way to securely package a set of VCs for transmission to a relying party, in a way that also allows the subject to prove control over the credentials.
- **Identifiers, Decentralized Identifiers**: an "identifier" refers to both a subject and an issuer of a VC. The identifier data type is a URI, one of which is a [W3C Decentralized Identifiers (DIDs)](https://www.w3.org/TR/did-core/), which is used in Verity implementations. Verity does not require the use of DIDs, but these are one way to implement identifiers that minimize correlatability and enable proof of control over credentials.
- **Credential Manifest**: standard from the Decentralized Identity Foundation (DIF) for requesting and receiving a credential. [Credential Manifest](https://identity.foundation/credential-manifest/) allows an issuer to describe (in a machine-readable way) what types (schemas) of credentials they issue, and what their requirements are. It also describes the format for a subject/holder to submit an application for a credential that conforms to those requirements in a machine-readable way.
- **Presentation Exchange**: A DIF standard enabling a verifier to describe what types of credentials they require from a subject/holder, and how the subject/holder can send a submission. See [DIF Presentation Exchange](https://identity.foundation/presentation-exchange)
- **Wallet and Credential Interactions**: wallet interaction protocols use a lightweight flow loosely based on the work-in-progress [DIF Wallet and Credential Interactions](https://identity.foundation/waci-presentation-exchange/) spec.

### Specifications and Libraries

> Note to Implementers: Decentralized Identity standards are emerging and at
> varying levels of maturity. Nonetheless, these standards are important to
> Verity’s design principles.
>
> To navigate this, the following specifications and libraries were selected
> for their promise of broadest adoption and interoperability. This list isn’t
> intended to be exclusive; support for additional standards may be added in
> the future.
>
> Further, Verity uses simplifications that remove the requirement for
> implementers to fully implement the referenced specifications. The flows and
> message structures described in this document suffice for wallet
> implementers.

| Specifications                                    | Reference                                                             |
| ------------------------------------------------- | --------------------------------------------------------------------- |
| W3C Verifiable Credentials Data Model             | https://www.w3.org/TR/vc-data-model/                                  |
| W3C Decentralized Identifiers (DIDs) v1.0         | https://www.w3.org/TR/did-core/                                       |
| DIF Presentation Exchange                         | https://identity.foundation/presentation-exchange                     |
| DIF Credential Manifest                           | https://identity.foundation/credential-manifest/                      |
| DIF Wallet and Credential Interactions (unstable) | https://identity.foundation/wallet-and-credential-interactions/       |
| W3C did:key Method                                | https://w3c-ccg.github.io/did-method-key/                             |
| IETF Multiformats Multibase                       | https://datatracker.ietf.org/doc/html/draft-multiformats-multibase-03 |
| IETF Multiformats Multicodec                      | https://datatracker.ietf.org/doc/html/draft-snell-multicodec-00       |

| Libraries                  | Reference                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------- |
| did-jwt-vc                 | https://github.com/decentralized-identity/did-jwt-vc                                  |
| did-resolver               | https://github.com/decentralized-identity/did-resolver                                |
| @transmute/did-key-ed25519 | https://github.com/transmute-industries/did-key.js/tree/main/packages/did-key-ed25519 |

## Credential Flows

The credential flows demonstrate use of a non-custodial credential and identifier wallet, but are easily adapted to hosted wallets and different flows.

### Issuance Flow

#### Overview

This flow enables a subject to send prerequisite information to the issuer before credential issuance. Prerequisites include:

- subject-controlled identifier (e.g. decentralized identifier) the credential should be issued to, along with a proof of control of the identifier
- other input credentials requested by the issuer (optional -- not used in initial verity flows)

The process is initiated by the wallet holder scanning a QR code, which allows the wallet to determine the input requirements, asking for consent before sending (typically including cryptographically signed proof). The issuer validates the request, issues a credential to the identifier specified by the subject, and returns the credential

This flow is based on the [DIF wallet and credential interaction (draft) specification](https://github.com/decentralized-identity/wallet-and-credential-interactions), which enables use of links or QR codes for wallet-initiated interactions.

#### Details

![Credential issuance sequence diagram demonstrating the steps below](/img/docs/sequence_issuance.png "Credential issuance sequence diagram")

1. Recipient initiates the credential request process by scanning QR code with their mobile wallet
2. The wallet decodes the QR code, which provides an issuer endpoint with more details to continue the interaction:

   1. QR code returns the URL from which to receive information at the` challengeTokenUrl`:

      ```
      {
          "challengeTokenUrl": "https://verity.id/..."
      }
      ```

   2. Wallet GETs the payload:

      ```
      GET {{challengeTokenUrl}}
      ```

   3. The return type is a JWM containing a [credential manifest](https://identity.foundation/credential-manifest/#credential-application), credential request endpoint, and a challenge to sign.

      ```
      {
        "id": "4487e7d1-7d10-4075-a923-bae9332266c1",
        "type": "https://verity.id/types/CredentialOffer",
        "from": "did:key:z6Mkgw8mPijYRa3TkHSYtQ4P7S2HGrcJBwzdgjeurqr9Luqb",
        "created_time": 1631582525816,
        "expires_time": 1634174525816,
        "reply_url": "https://...",
        "body": {
          "challenge": "d273da29-74dd-46de-a53c-1677c51cc700",
          "manifest": { }
        }
      }
      ```

3. Depending on the wallet implementation, the wallet generally prompts the user for approval to proceed, notifying which data is to be shared (from the credential manifest)
4. On approval, the wallet generates/provides a decentralized identifier, builds the credential request, and signs it to achieve [proof of identifier control](https://identity.foundation/presentation-exchange/#proof-of-identifier-control).

   1. In the Verity demo, the wallet generates a did:key DID, builds a [credential application](https://identity.foundation/credential-manifest/#credential-application), and signs the credential application, along with the challenge, with the private key corresponding to the DID.
   1. The Verity library exposes a convenience method `createCredentialApplication` for this purpose -- this is used by demo-wallet in preparing a credential application.
   1. Note: the Verity demo does not require the wallet to submit credentials for issuance, as the credential recipient is already known to the issuer, but the credential manifest and credential application structures allow for this if needed.
   1. Example: [Credential Application](#credential-application)

5. The wallet sends the credential application to the issuer's endpoint

   ```
   POST {{replyUrl}}
   ```

6. The issuer issues the credential and returns it to the wallet

   1. The issuer accepts and validates the input and, on success, issues a Verifiable Credential.
   1. In the Verity demo, the issuer replies with a [credential fulfullment](https://identity.foundation/credential-manifest/#credential-fulfillment)-structured result containing a JWT-encoded Verifiable Presentation.
   1. Examples:
      1. [Credential Fulfillment](#credential-fulfillment)
      1. [Decoded Credential](#decoded-credential)

7. Wallet stores credential

### Verification Flow

#### Overview

This flow enables a verifier or relying party to request credentials and proof requirements from the subject/holder.

The process is initiated by the wallet holder scanning a QR code, which allows the wallet to determine the credential/proof requirements, asking for consent before sending (typically including cryptographically signed proof).

This flow is based on the [DIF wallet and credential interaction (draft) specification](https://github.com/decentralized-identity/wallet-and-credential-interactions), which enables use of links or QR codes for wallet-initiated interactions.

#### Details

The exchange flow similarly initiates with the credential holder performing a QR scan. See message samples in [Presentation Exchange](#presentation-exchange)

![Credential exchange sequence diagram demonstrating the steps described below](/img/docs/sequence_exchange.png "Credential exchange sequence diagram")

## Appendix: Message Samples

This section contains examples of the messages referenced above.

### Credential Issuance

#### QR Code

Credential subjects initiate credential issuance flows by scanning a QR code, provided by the issuer, with their credential wallet.

Sample:

```
{
    "challengeTokenUrl": "https://verity.id/..."
}
```

#### Credential Offer

An issuer credential offer tells the wallet how to initiate a credential issuance request. It is a simple JWM wrapper around a DIF Credential Manifest.

Sample:

```
{
  "id": "4487e7d1-7d10-4075-a923-bae9332266c1",
  "type": "https://verity.id/types/CredentialOffer",
  "from": "did:key:z6Mkgw8mPijYRa3TkHSYtQ4P7S2HGrcJBwzdgjeurqr9Luqb",
  "created_time": 1631582525816,
  "expires_time": 1634174525816,
  "reply_url": "https://...",
  "body": {
    "challenge": "d273da29-74dd-46de-a53c-1677c51cc700",
    "manifest": { }
  }
}
```

Details:

- from: who the message is from; in this case, the issuer
- reply_url: the URL the wallet should send the credential application to
- body.challenge: a challenge the wallet should sign when proving control, to prevent replays
- body.manifest: follows the DIF Credential Manifest spec

#### Credential Application

A credential application is sent from the wallet to the issuer before issuance. It contains the recipient identifier and other information required for issuance. This follows the DIF Credential Manifest Spec.

```
{
  "credential_application": {
    "id": "aaa23771-b8c1-4d06-bdc8-8bc2106e2456",
    "manifest_id": "KYCAMLAttestation",
    "format": {
      "jwt_vp": {
        "alg": [
          "EdDSA",
          "ES256K"
        ]
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

#### Credential Fulfillment

```
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

#### Decoded Credential

```
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
    "type": [
        "VerifiableCredential",
        "KYCAMLAttestation"
    ],
    "credentialStatus": {
        "id": "http://192.168.1.16:3000/api/revocation/05c74310-4810-4ec4-8402-cee4c28dda91#94372",
        "type": "RevocationList2021Status",
        "statusListIndex": "94372",
        "statusListCredential": "http://192.168.1.16:3000/api/revocation/05c74310-4810-4ec4-8402-cee4c28dda91"
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

### Presentation Exchange

#### QR Code

Credential holders initiate credential exchange flows by scanning a QR code, provided by the verifier, with their credential wallet.

Sample:

```
{
    "challengeTokenUrl": "https://verity.id/..."
}
```

#### Presentation Request

```
{
    "id": "1308e77f-9ab0-4de7-97a8-ad2111b585bf",
    "type": "https://verity.id/types/VerificationRequest",
    "from": "did:key:z6MkizuwMHiYpZrBAn64ZnbS2cz5og7iGqAa3nV3EuTj4aaZ",
    "created_time": 1631650772655,
    "expires_time": 1634242772655,
    "reply_url": "http://192.168.1.16:3000/api/verification/1308e77f-9ab0-4de7-97a8-ad2111b585bf/submission",
    "body": {
        "status_url": "http://192.168.1.16:3000/api/verification/1308e77f-9ab0-4de7-97a8-ad2111b585bf/callback",
        "challenge": "e0e52794-7889-451c-bb05-28d8cff9ed13",
        "presentation_definition": {
            "id": "KYCAMLPresentationDefinition",
            ...
        }
    }
}
```

Details:

- from: who the message is from; in this case, the issuer
- reply_url: the URL the wallet should send the credential submission to
- body.challenge: a challenge the wallet should sign when proving control, to prevent replays
- body.presentation_definition: this follows the DIF Presentation Definition spec
- body.status_url: url returning verification results when complete

#### Presentation Submission

```
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

#### Response

```
{
    "status": "approved"
}
```
