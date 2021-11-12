---
sidebar_label: Issuing Credentials
sidebar_position: 1
---

# Issuing Verifiable Credentials

Identity providers can issue portable and decentralized Verifiable Credentials to their users. Verifiable Credentials represent provable claims associated with an identity. They can represent any number of claims -- proof of KYC, credit score, etc.

Verifiable Credentials are issued to a recipient-controlled identifier (such as a DID), which increases the ability for the recipient to use the credential in different contexts through [holder/subject binding techniques](https://identity.foundation/presentation-exchange/#holder-and-subject-binding) that prove control over an identifier.

Collecting that identifier in a secure and convenient way for the user requires different interaction flows; the following pattern is one way an issuer can enable this process for an authenticated user.

## Issuance Flow

In this specific example, a logged-in account holder requests a KYC or credit score credential to be held in their mobile wallet. The flow consists of the exchange of three distinct JSON objects 1) a Credential Offer published by the Issuer that describes the credential and how to apply for it, 2) A Credential Application submitted by the wallet, and 3) a Credential Fulfillment returned by the Issuer that encodes the final credential.

![Issuing a Credential](/img/docs/sequence_issuance.png "Issuing a Credential")

1. A User signs into the Issuer site
1. The Issuer presents a QR code.
1. User scans the QR code with their wallet.
1. Wallet parses the QR code, which encodes a JSON object with a `challengeTokenUrl` property.
1. Wallet performs a GET request at that URL to return a Credential Offer, a wrapper around a [Credential Manifest](https://identity.foundation/credential-manifest/#credential-manifest-2), with three supplementary properties:
   - The issuer DID.
   - A URL for the wallet to submit a Credential Application.
   - A challenge to sign.
1. The wallet prompts the user to proceed. The Credential Manifest includes descriptive properties, e.g. in the Verity demo app a title and description of the credential are shown.
1. Once the recipient proceeds, the wallet prepares a signed [Credential Application](https://identity.foundation/credential-manifest/#credential-application),
   - If the wallet doesn't have a DID, it generates one.
   - The wallet creates a Credential Application for the DID.
   - The application is signed along with the challenge in the Credential Offer
   - The Verity library exposes a convenience method `createCredentialApplication` for this purpose.
1. Wallet submits the Credential Application to the URL found in the Credential Offer.
1. The Issuer creates a Verifiable Credential and returns it to the wallet as a [Credential Fulfillment](https://identity.foundation/credential-manifest/#credential-fulfillment).
1. Wallet persists the credential.

### Sample JSON objects

- [Credential Offer](/docs/appendix/messages#credential-offer)
- [Credential Manifest](/docs/appendix/messages#credential-manifest)
- [Credential Application](/docs/appendix/messages#credential-application)
- [Credential Fulfillment](/docs/appendix/messages#credential-fulfillment)
